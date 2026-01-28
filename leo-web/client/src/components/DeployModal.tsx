import * as React from "react";
import { X, Rocket, Github, CheckCircle, AlertCircle, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

export interface DeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  githubUrl: string;
  generationId: number;
  deploymentUrl?: string | null;
  onDeploy?: () => void;
  isDeploying?: boolean;
  deployError?: string;
  deploySuccess?: boolean;
}

/**
 * DeployModal - Modal showing deployment instructions for Fly.io
 *
 * Displays GitHub repository URL and step-by-step deployment instructions
 * for deploying generated apps to Fly.io using their CLI or GitHub Actions.
 */
export function DeployModal({
  isOpen,
  onClose,
  githubUrl,
  generationId,
  deploymentUrl,
  onDeploy,
  isDeploying = false,
  deployError,
  deploySuccess = false,
}: DeployModalProps) {
  // Close modal on escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
          <CardHeader className="sticky top-0 bg-background border-b z-10">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Rocket className="h-6 w-6" />
                  Deploy to Fly.io
                </CardTitle>
                <CardDescription>
                  Your app is ready to deploy! Follow the instructions below to launch it on Fly.io.
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            {/* Automated Deployment Section */}
            {onDeploy && (
              <Card className="border-2 border-primary/20 bg-primary/5">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Rocket className="h-5 w-5" />
                        Automated Deployment
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Deploy your app to Fly.io with one click. The deployment typically takes 5-10 minutes.
                      </p>
                    </div>
                  </div>

                  {/* Deployment Status */}
                  {deploymentUrl ? (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        <div className="space-y-2">
                          <p className="font-medium">Your app is live!</p>
                          <a
                            href={deploymentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-primary hover:underline font-mono text-sm"
                          >
                            {deploymentUrl}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ) : deploySuccess ? (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        Deployment successful! Your app will be live shortly.
                      </AlertDescription>
                    </Alert>
                  ) : deployError ? (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        <div className="space-y-1">
                          <p className="font-medium">Deployment failed</p>
                          <p className="text-sm">{deployError}</p>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ) : isDeploying ? (
                    <Alert className="border-blue-200 bg-blue-50">
                      <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                      <AlertDescription className="text-blue-800">
                        <div className="space-y-1">
                          <p className="font-medium">Deploying your app...</p>
                          <p className="text-sm">This may take 5-10 minutes. Please keep this window open.</p>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ) : null}

                  {/* Deploy Button */}
                  {!deploymentUrl && (
                    <Button
                      onClick={onDeploy}
                      disabled={isDeploying}
                      size="lg"
                      className="w-full gap-2"
                    >
                      {isDeploying ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Deploying...
                        </>
                      ) : (
                        <>
                          <Rocket className="h-5 w-5" />
                          Deploy to Fly.io Now
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* GitHub Repository */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Github className="h-5 w-5" />
                <h3 className="text-lg font-semibold">GitHub Repository</h3>
                <Badge variant="outline" className="ml-auto">
                  Generation #{generationId}
                </Badge>
              </div>
              <div className="p-4 rounded-lg bg-muted border">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground mb-1">Repository URL</p>
                    <a
                      href={githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-mono text-sm truncate block"
                    >
                      {githubUrl}
                    </a>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(githubUrl, "_blank")}
                  >
                    Open in GitHub
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Your generated app has been pushed to GitHub with a pre-configured fly.toml file.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
