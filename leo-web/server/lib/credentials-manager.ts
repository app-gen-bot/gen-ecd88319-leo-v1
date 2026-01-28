/**
 * Credentials Manager
 *
 * Stores and retrieves app credentials using Supabase Vault for encryption at rest.
 * Credentials survive between sessions and are restored on resume.
 *
 * Architecture:
 * - Vault stores the actual secret values (encrypted at rest)
 * - app_credentials table maps env keys to vault secret IDs
 * - On resume, credentials are retrieved from vault and passed to container
 */

import { db } from './db';
import { appCredentials } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

export interface EnvCredential {
  key: string;
  value: string;
}

/**
 * Store credentials for an app using Supabase Vault
 *
 * Creates encrypted secrets in Vault and maps them to the app.
 * Uses upsert to handle both new credentials and updates.
 *
 * @param appId - The app ID from apps table
 * @param credentials - Array of {key, value} credentials to store
 */
export async function storeAppCredentials(appId: number, credentials: EnvCredential[]): Promise<void> {
  if (credentials.length === 0) {
    console.log(`[CredentialsManager] No credentials to store for app ${appId}`);
    return;
  }

  console.log(`[CredentialsManager] Storing ${credentials.length} env vars for app ${appId}`);

  for (const cred of credentials) {
    try {
      // Create secret in Vault
      // vault.create_secret(secret, name, description) returns the secret ID
      const secretName = `app_${appId}_${cred.key}`;
      const secretDescription = `Credential ${cred.key} for app ${appId}`;

      const vaultResult = await db.execute(sql`
        SELECT vault.create_secret(
          ${cred.value}::text,
          ${secretName}::text,
          ${secretDescription}::text
        ) as secret_id
      `) as unknown as { secret_id: string }[];

      const secretId = vaultResult[0]?.secret_id;

      if (!secretId) {
        console.error(`[CredentialsManager] Failed to create vault secret for ${cred.key}`);
        continue;
      }

      // Upsert mapping in our table
      await db.insert(appCredentials)
        .values({
          appId,
          envKey: cred.key,
          vaultSecretId: secretId,
        })
        .onConflictDoUpdate({
          target: [appCredentials.appId, appCredentials.envKey],
          set: {
            vaultSecretId: secretId,
            updatedAt: new Date(),
          },
        });

      console.log(`[CredentialsManager] Stored ${cred.key} for app ${appId}`);
    } catch (error) {
      console.error(`[CredentialsManager] Failed to store ${cred.key} for app ${appId}:`, error);
      // Continue with other credentials
    }
  }
}

/**
 * Retrieve all credentials for an app (decrypted)
 *
 * Joins with vault.decrypted_secrets to get actual values.
 * Returns empty array if no credentials found.
 *
 * @param appId - The app ID from apps table
 * @returns Array of {key, value} credentials
 */
export async function getAppCredentials(appId: number): Promise<EnvCredential[]> {
  try {
    // Join app_credentials with vault.decrypted_secrets to get decrypted values
    const result = await db.execute(sql`
      SELECT
        ac.env_key as key,
        vs.decrypted_secret as value
      FROM app_credentials ac
      JOIN vault.decrypted_secrets vs ON vs.id = ac.vault_secret_id
      WHERE ac.app_id = ${appId}
    `) as unknown as { key: string; value: string }[];

    const credentials: EnvCredential[] = result.map(row => ({
      key: row.key,
      value: row.value,
    }));

    if (credentials.length > 0) {
      console.log(`[CredentialsManager] Retrieved ${credentials.length} credentials for app ${appId}`);
    }

    return credentials;
  } catch (error) {
    console.error(`[CredentialsManager] Failed to retrieve credentials for app ${appId}:`, error);
    return [];
  }
}

/**
 * Check if an app has stored credentials
 *
 * @param appId - The app ID from apps table
 * @returns true if credentials exist
 */
export async function hasAppCredentials(appId: number): Promise<boolean> {
  try {
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(appCredentials)
      .where(eq(appCredentials.appId, appId));

    return (result[0]?.count ?? 0) > 0;
  } catch (error) {
    console.error(`[CredentialsManager] Failed to check credentials for app ${appId}:`, error);
    return false;
  }
}

/**
 * Delete all credentials for an app
 *
 * Must be called BEFORE app deletion to clean up Vault secrets.
 * The app_credentials table rows will be deleted by CASCADE,
 * but Vault secrets need explicit deletion.
 *
 * @param appId - The app ID from apps table
 */
export async function deleteAppCredentials(appId: number): Promise<void> {
  try {
    // Get vault secret IDs first
    const creds = await db.select({ vaultSecretId: appCredentials.vaultSecretId })
      .from(appCredentials)
      .where(eq(appCredentials.appId, appId));

    if (creds.length === 0) {
      return;
    }

    console.log(`[CredentialsManager] Deleting ${creds.length} vault secrets for app ${appId}`);

    // Delete from Vault
    for (const cred of creds) {
      try {
        await db.execute(sql`
          DELETE FROM vault.secrets WHERE id = ${cred.vaultSecretId}
        `);
      } catch (error) {
        console.warn(`[CredentialsManager] Failed to delete vault secret ${cred.vaultSecretId}:`, error);
        // Continue with other secrets
      }
    }

    // Note: app_credentials rows are deleted by CASCADE when app is deleted
  } catch (error) {
    console.error(`[CredentialsManager] Failed to delete credentials for app ${appId}:`, error);
  }
}

/**
 * Convert credentials array to environment variables object
 *
 * @param credentials - Array of {key, value} credentials
 * @returns Object with env var names as keys
 */
export function credentialsToEnv(credentials: EnvCredential[]): Record<string, string> {
  const env: Record<string, string> = {};
  for (const cred of credentials) {
    env[cred.key] = cred.value;
  }
  return env;
}
