# SSH

**Source:** https://docs.replit.com/replit-workspace/ssh  
**Section:** replit-workspace  
**Scraped:** 2025-09-08 20:20:23

---

FeaturesSSHCopy pageLearn how to set up and use SSH to connect your local development environment to Replit Apps for secure remote access and file synchronization.Copy page

## ​What is SSH?

SSH, which stands for Secure Shell, is a secure protocol that facilitates remote access to your Replit App’s command line interface. With SSH, you can seamlessly transfer files and leverage your preferred local Integrated Development Environment (IDE) for editing code on Replit, enhancing collaboration and productivity in your development workflow.

SSH functionality is available for Core, Teams, and all other paid plans.

Here’s an overview of the process:

- Generate an SSH keypair on your local machine
- Add that SSH key to the SSH pane inside any Replit App
- Connect using an SSH client or an editor which can work over SSH (like VSCode or Cursor)

SSH keys are associated with your account, not a particular Replit App. This means that you only need to add a public key once, after which you can connect to any Replit App you have access to.

## ​Why use SSH?

- Automatic updates between Replit App and editor: Any changes made in the Replit App are reflected in your editor instantly, and any modifications in the editor are updated in the Replit App. This seamless synchronization ensures that your codebase is always up-to-date across platforms.
- File management synchronization: Whether you add, delete, or update files, these changes are synchronized in real time between your editor and the Replit App. This feature ensures that your project structure remains consistent, regardless of where the changes are initiated.
- Folder management and file moving: Moving files across folders is also synchronized between your editors and the Replit App. This ensures that organizational changes made in one environment are accurately reflected in the other, maintaining the integrity and structure of your project.

## ​Find or create a keypair

To configure SSH for your account, you’ll need your SSH public key.

### ​Figuring out if you already have a keypair

You can check if you already have a public key by running the following command in a Terminal on your local computer:

- Mac/Linux
- Windows

Copy

Ask AI

```
ls -l ~/.ssh

```

If you get an error, that’s OK, proceed to Generating a new keypair.
If you see a file called replit.pub, please proceed to Get the contents of your public key.

### ​Generating a new keypair

On your machine, open a Terminal (or Command Prompt) window and paste the following command:

- Mac/Linux
- Windows

Copy

Ask AI

```
ssh-keygen -t ed25519 -f ~/.ssh/replit -q -N ""

```

This command checks if a specific SSH public key file already exists. If not, it creates a new SSH key with some sensible parameters.

### ​Get the contents of your public key

Once you have either confirmed you have a keypair or created one, display the contents of the public key (one of the two similarly named files, suffixed with .pub), as we’ll need that for later.

- Mac/Linux
- Windows

Copy

Ask AI

```
cat ~/.ssh/replit.pub

```

Save the contents of replit.pub to use later in this article and proceed to add the SSH key to your account.

## ​Add the SSH key to your account

### ​Add the public key directly in a Replit App, using the SSH pane

1. In your Replit App on any window, select the + button, then search for SSH.

1. Navigate to the Keys tab and select New SSH key.
1. In the popup window, enter a Label for your key (e.g., my-ssh-key) and paste the public key you copied into the Key section.
Select the Add SSH Key button. Your key has been added and authorized for use.

### ​Add the public key directly in your Account

You can also add an SSH key by navigating to your Account and selecting SSH keys.

Select the Add SSH key button and paste in the contents of replit.pub that we obtained from the previous section, Find or create a keypair.

When you have multiple public keys on your machine, it’s important to ensure that you use the correct combination of private and public keys for your SSH configuration.

## ​Connecting to your Replit App

### ​Configure your SSH config

1. In a terminal, ensure the ~/.ssh directory and ~/.ssh/config file exist:

- Mac/Linux
- Windows

Copy

Ask AI

```
mkdir -p ~/.ssh && chmod 700 ~/.ssh && touch ~/.ssh/config && chmod 600 ~/.ssh/config
open -a 'TextEdit' ~/.ssh/config || nano ~/.ssh/config

```

1. Add a configuration block to use the replit keypair for all *.replit.dev domains:

- Mac/Linux/Windows

Copy

Ask AI

```
Host *.replit.dev
    Port 22
    IdentityFile ~/.ssh/replit
    StrictHostKeyChecking accept-new

```

### ​Connect from VSCode or Cursor

1. From a Replit App, open the SSH pane
1. In the SSH pane, navigate to the Connect tab and select Launch VS Code.

- Connect with VSCode

1. If you are prompted to fill out ~/.ssh/config, enter the following:
CopyAsk AIHost *.replit.dev
    Port 22
    IdentityFile ~/.ssh/replit
    StrictHostKeyChecking accept-new

Adding SSH configuration is only prompted the first time you are trying to connect to VS Code or another editor. To return to the configuration file, you will need to select Configure SSH Hosts….
1. If prompted by an external application warning, select Yes to confirm you want to open your project in your preferred editor or VS Code.
1. You may be asked to install or update SSH extensions periodically. Replit will endeavor to be compatible with the latest versions of these IDEs, and you may get important security updates as well.

### ​Connect manually

At the bottom of the SSH pane’s “Connect” tab, you will find “Connect manually”.

Copy that command, paste it into either a local Terminal (Mac or Linux) or local Command Prompt (Windows) in order to connect directly.

This is also a good way to debug connection issues with IDEs, as well as to collect valuable “verbose” connection information when reporting bugs to Replit Support.

An error indicating we are attempting to connect with a nonexistent private key:

Copy

Ask AI

```
$ ssh -i ~/.ssh/replit -p 22 c96b6ade-d5e4-4f7a-bc5b-52334509b2a3@c96b6ade-d5e4-4f7a-bc5b-52334509b2a3-00-16nh2hskw3ql8.riker.replit.dev
Warning: Identity file /Users/user/.ssh/replit not accessible: No such file or directory.

```

Full debug logs of an SSH connection attempt, to include with a bug report:

Copy

Ask AI

```
$ ssh -vvv -i ~/.ssh/replit -p 22 c96b6ade-d5e4-4f7a-bc5b-52334509b2a3@c96b6ade-d5e4-4f7a-bc5b-52334509b2a3-00-16nh2hskw3ql8.riker.replit.dev
OpenSSH_9.6p1, LibreSSL 3.3.6
debug1: Reading configuration data /Users/.../.ssh/config
debug1: /Users/.../.ssh/config line 1: Applying options for *
debug1: /Users/.../.ssh/config line 4: Applying options for *.replit.dev
debug3: channel_clear_timeouts: clearing
debug1: Connecting to c96b6ade-d5e4-4f7a-bc5b-52334509b2a3-00-16nh2hskw3ql8.riker.replit.dev port 22.
debug1: Connection established.
debug1: identity file /Users/dstewart/.ssh/replit type 3
debug1: Local version string SSH-2.0-OpenSSH_9.6
debug1: Remote protocol version 2.0, remote software version Replit-SSH-Proxy
debug1: compat_banner: no match: Replit-SSH-Proxy
debug3: fd 5 is O_NONBLOCK
...
Welcome to the Replit SSH Proxy.

Visit https:/.replit.com/replit-workspace/ssh to learn more about SSH on Replit.
debug3: receive packet: type 51
debug1: Authentications that can continue: password,publickey
debug3: start over, passed a different list password,publickey
debug3: preferred publickey,keyboard-interactive,password
debug3: authmethod_lookup publickey
debug3: remaining preferred: keyboard-interactive,password
debug3: authmethod_is_enabled publickey
debug1: Next authentication method: publickey
...
debug2: we did not send a packet, disable method
debug3: authmethod_lookup password
debug3: remaining preferred: ,password
debug3: authmethod_is_enabled password
debug1: Next authentication method: password

```

### ​Connect via a tool not listed here

There are many SSH clients available for different platforms and operating systems, many offering different features or integrations.

You can always break down the command displayed in “Connect Manually” into its constituent components to determine how to configure each client:

Copy

Ask AI

```
ssh -i ~/.ssh/replit -p 22  c96b6ade-d5e4-4f7a-bc5b-52334509b2a3@c96b6ade-d5e4-4f7a-bc5b-52334509b2a3-00-16nh2hskw3ql8.riker.replit.dev
       ^-----v-----^    ^^  ^-----------------v----------------^ ^------------------------------v-------------------------------------^
        Private Key   Port                   User               @                           Hostname

```

Hostname: <your_hostname>.<cluster>.replit.dev
Port: <port_number>
User: Username
Private Key: Path to the private key file on your computer. Usually next to replit.pub.

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/replit-workspace/workspace-features/shell)

[OverviewTrack changes, collaborate with others, and manage your code's evolution using Replit's integrated version control tools.Next](https://docs.replit.com/replit-workspace/workspace-features/version-control)
