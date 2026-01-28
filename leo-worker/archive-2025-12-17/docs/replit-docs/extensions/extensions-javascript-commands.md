# JavaScript Commands

**Source:** https://docs.replit.com/extensions/examples/javascript-commands  
**Section:** extensions  
**Scraped:** 2025-09-08 20:13:36

---

ExamplesJavaScript CommandsCopy pageLearn how to build an extension that adds JavaScript-related commands to Replit for managing npm packages and running scripts.Copy page

This tutorial assumes that you have basic web development knowledge, some familiarity with Replit, and familiarity with the Command system.

In a gist, we will fork an extension template, add a background script, and in that background script, write code that adds Commands to to the Replit workspace. Our command can be thought of as a simple tree. There’s a root command called “JavaScript tools”. It returns three subcommands:

- “Install”: This command lets you search the npm registry for packages to install, based on what you’ve typed. Selecting a package opens a new shell and invokes npm install <package name>

- “Scripts”: This command displays scripts in your package.json file. Selecting the script opens a new shell and invokes that command.

- “Uninstall”: This returns all your installed packages. Selecting a package uninstalls it

## ​Setting up your extension replit app

The first thing you want to do is fork an extension template. We recommend using the React Extension Template. although we are not going to write any react code in this tutorial.

Add a background script to your extension. You can scaffold a background script by typing in replkit add background in the shell. This creates a new folder src/background. The src/background/main.tsx file here is where we’ll be writing our code.

## ​Adding a root command

Let’s add a simple root command to the command bar to contain our subcommands.

Copy

Ask AI

```
async function main() {
  await replit.commands.add({
    id: "js-commands",
    contributions: [replit.ContributionType.CommandBar],
    command: {
      label: "JS",
      description: "JavaScript Commands",
      icon: "js.png",
      commands: async () => {
        // This is where subcomands go:
        return [];
      },
    },
  });
}

main();

```

This adds an empty ‘context’ command, AKA a command that contains other sub-commands. This is what it looks like:

## ​Building “Uninstall”

Let’s start with Uninstall. This command first figures out what packages you have installed, and then runs npm uninstall ${package}

The simplest way to figure out what you have installed is by parsing package.json, and looking at the dependencies object. Since this tutorial is focused on commands, here’s the code that reads package.json and returns an array of installed packages:

Copy

Ask AI

```
async function getPackageJson() {
  // This uses replit's filesystem API to read the package.json file. The command returns an object containing `content` as a string, or an `error` field if something went wrong
  const res = await replit.fs.readFile("package.json");

  if (res.error) return { error: res.error, result: null };

  try {
    let packageJsonObject = JSON.parse(res.content);
    return { error: null, result: packageJsonObject };
  } catch (e) {
    return {
      error: new Error("Failed to parse package.json: " + e.message),
      result: null,
    };
  }
}

async function getInstalledPackages() {
  const packageJsonRes = await getPackageJson();

  if (packageJsonRes.error) return packageJsonRes;

  // This returns an array of { name, version } objects
  const packages = Object.entries(packageJsonRes.result.dependencies).map(([name, version]) => ({
    name,
    version,
  }));

  return {
    error: null,
    result: packages,
  }
}

```

Armed with these functions, we can build the uninstall subcommand. The subcommand returns a list of action commands, one per package.

Copy

Ask AI

```
const uninstallCommand = {
  label: "Uninstall",
  description: "Uninstall npm packages",
  commands: async () => {
    const packagesRes = await getInstalledPackages();

    if (packagesRes.error) {
      return null;
    }

    return packagesRes.result.map(({ name, version }) => {
      return {
        label: name,
        description: version,
        run: async () => {
          await replit.exec.exec(`npm uninstall ${name}`);
        },
      };
    });
  },
};

```

To add this command to our root command, simply include uninstallCommand as one of the commands returned by the root command:

Copy

Ask AI

```
    {
      commands: async () => {
        // This is where subcomands go:
        return [
            uninstallCommand,
        ];
      },
    }

```

This is what it looks like in our JavaScript command now:

As you can see, the uninstall command lists installed npm packages that you can uninstall

## ​Building “Scripts”

“Scripts” is very similar to uninstall, except that we need to surface the output from the script. For this, we use an experimental API called execInShell.

Other than that, we can reuse most of the code from “Uninstall”

Copy

Ask AI

```
async function getScripts() {
  const packageJsonRes = await getPackageJson();

  if (packageJsonRes.error) return packageJsonRes;

  // This returns an array of { name, version } objects
  const scripts = Object.entries(packageJsonRes.result.scripts).map(
    ([name, cmd]) => ({
      name,
      cmd,
    }),
  );

  return {
    error: null,
    result: scripts,
  };
}

const scriptsCommand = {
  label: "Scripts",
  description: "Run scripts in your package.json",
  commands: async () => {
    const scriptsRes = await getScripts();

    if (scriptsRes.error) {
      return null;
    }

    return scriptsRes.result.map(({ name, cmd }) => {
      return {
        label: name,
        description: cmd,
        run: async () => {
          await replit.experimental.execInShell(`npm run ${name}`);
        },
      };
    });
  },
};

```

Let’s add the scripts command to our root command!

Copy

Ask AI

```
    {
      commands: async () => {
        // This is where subcomands go:
        return [
            scriptsCommand,
            uninstallCommand,
        ];
      },
    }

```

Here’s our command!

## ​Building “Install”

“Install” is somewhat different: we are pulling external data from the npm registry in response to the user typing in a search query. And we only want to explicitly trigger this search when the user has indicated that they want to search for npm packages to install

Copy

Ask AI

```
async function getNpmPackages(search) {
  try {
    const res = await fetch(
      `https://registry.npmjs.org/-/v1/search?text=${search}`,
    );
    const json = await res.json();

    return { error: null, result: json.objects };
  } catch (e) {
    return { error: e, result: null };
  }
}

const installCommand = {
  label: "Install",
  description: "Install a package from npm",
  commands: async ({ search, active }) => {
    // This makes sure we do not perform a search unless someone selects "Install"
    if (!active) {
      return;
    }

    const packagesRes = await getNpmPackages();

    if (packagesRes.error) {
      return null;
    }

    return packagesRes.result.map((pkg) => {
      return {
        label: pkg.package.name,
        description: pkg.package.description,
        run: async () => {
          await replit.experimental.execInShell(`npm i ${pkg.package.name}`);
        },
      };
    });
  },
};

```

Notice the search and active parameters?

- active is true when users have selected the “Install” command (as opposed to the command system merely querying for subcommands in advance). We can check for it to make sure that we only query npm when we know that a user is interested in installing an extension.
- search returns what the user has typed into the command bar, which we use for searching the npm registry

This means that extensions can decide which scripts are directly accessible from the root CommandBar. For example, the scripts extension can let users search and trigger scripts immediately after opening the CommandBar:

We are ready to add “Install” to the root command! This is what our root command object looks like now:

Copy

Ask AI

```
  await replit.commands.add({
    id: "js-commands",
    contributions: [replit.ContributionType.CommandBar],
    command: {
      label: "JS",
      description: "JavaScript Commands",
      commands: async () => {
        // This is where subcomands go:
        return [
            installCommand,
            scriptsCommand,
            uninstallCommand,
        ];
      },
    },
  });

```

Open the command bar, type in “Install”, select your new command, and give it a try!

## ​Exercises left to the reader

We built a basic version of the JavaScript commands extension. This could be improved quite a bit:

- Did you notice that we only use npm in all the examples? JavaScript ecosystem has a plethora of package managers, including yarn, pnpm, and bun. How can we support all of them? And can we do it “magically” where someone using this extension doesn’t have to manually select their package manager in our command? (Hint: it involves the lockfiles)
- We can probably cache the npm registry fetch call, so when you backspace through any letters, the results for that search query appear instantly.
- We can debounce npm search requests to prevent hitting npmjs.com excessively while you’re typing out the package you’re looking for.
- What happens if someone uses this command in a replit app that isn’t a JavaScript project? We can probably check for the presence of package.json before showing the command. And maybe, if someone doesn’t have a package.json yet, we can instead show a command to npm init their project!

If you just want to look at the solution, see the JavaScript commands extension on the store:

- Here’s the link to the extension
- Here’s a link to the extension’s source replit app

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/extensions/examples/snippet-manager)

[ManifestLearn how to configure your Replit Extension with the extension.json manifest file. View required fields, optional properties, and supported types.Next](https://docs.replit.com/extensions/api/manifest)
