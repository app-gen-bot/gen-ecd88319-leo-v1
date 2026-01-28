# Conflict Resolution in Projects

**Source:** https://docs.replit.com/teams/projects/resolving-conflicts  
**Section:** teams  
**Scraped:** 2025-09-08 20:18:42

---

ProjectsConflict Resolution in ProjectsCopy pageLearn how to handle and resolve merge conflicts when multiple team members make changes to the same files in a Replit Project.Copy page

## ​Overview

When two teammates make changes to the same files in a Project, it is possible to end up with a merge conflict.

## ​Resolving a merge conflict

In this example, the main Replit App has a change to the joke endpoint. In your Replit App, if you also change the joke endpoint and attempt to sync or merge your changes, you’ll hit a merge warning:

If you click the “resolve manually” button, the git tool will open up in conflict resolution mode to help you resolve the conflict:

You will see conflict markers <<<<<<< HEAD, ======= and >>>>>>> dd936daa.... This is git’s way of showing you the conflict it encountered and the two different version of the code it found. The bit between <<<<<<< HEAD and ======= is the version of the joke endpoint found in the main Replit App (which was merged in between the time when you created your fork and the time you attempted to merge your fork), and the bit between ======= and >>>>>>> dd936daa... is your change to the joke endpoint.

Resolving a merge conflict simply means editing the file to remove the conflict markers. Sometimes this means picking one change or the other. Other times this means picking parts of each version to create a blended version. In this situation, you can pick your version of the change:

The “Complete merge and commit” button will be enabled when you have resolved all the conflicts. When you click it, you’ll end up with a new commit that resolves the conflict:

You will now be able to merge your changes back into the main Replit App.

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/teams/projects/overview)

[Public ProfilesLearn how to create and customize your organization's public profile on Replit to showcase your brand, products, and public Replit Apps to the community.Next](https://docs.replit.com/teams/public_profiles)
