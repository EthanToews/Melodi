# Melodi
Melodi - Beat Maker is a social rhythmic beat creator.
Made By: David, Ben, and Ethan

Final Project for Advanced Internet Programming at the University of Winnipeg

| Command | Description |
| --- | --- |
| git clone -b main https://github.com/EthanToews/Melodi.git | This will create a project folder with all the code from the main branch |
| npm install | Installs all of the dependencies in the package.json file |
| npm start | Runs the app.js file |
| git checkout -b <new branch name> | Creates a new local branch |
| git add . | Adds/stages all of your changes to your local branch |
| git status | View all Added/staged and unstaged changes |
| git commit -m "MESSAGE" | Commit your Added/staged changed to your local branch |
| git push -u origin <branch name> | Push all of your commited changed to github under <branch name> |
| git pull origin <branch> | Pull code from a branch to your local branch, !!This can overwite your changes!! |

# Setup
First you will want to clone the development branch:
```
git clone -b dev https://github.com/EthanToews/Melodi.git
```

Next you will want to install your dependencies:
```
npm install
```

You can now run the server with:
```
npm start
```
or
```
node app.js
```

# Before Making Changes
Just a rule of thumb is to checkout to new local branch before working 

(Jira will generate this code for you, in Jira open task then on left side click "Create Branch" and copy the text)
```
git checkout -b <branch name>

Example: git checkout -b MEL-1-setting-up-project
```

# After Making Changes
Stage your changes in your local branch
```
git add .
```

To see the files you have staged
```
git status
```

Now you can add a commit message to wrap up all your staged files with:
```
git commit -m "your message"
```
When committing code please use ```Semantic Commit Messages``` all lowercase
in the format: ```<type>(<scope>): <subject>```
- ```feat```: (new feature for the user, not a new feature for build script)
- ```fix```: (bug fix for the user, not a fix to a build script)
- ```docs```: (changes to the documentation)
- ```style```: (formatting, missing semi colons, etc; no production code change)
- ```refactor```: (refactoring production code, eg. renaming a variable)
- ```test```: (adding missing tests, refactoring tests; no production code change)
- ```chore```: (updating grunt tasks etc; no production code change)

Example: ```git commit -m "feat(home page): added the following button"```

Now you are ready to push to the git repository!! 
Make sure to push to the same branch you did ```git checkout -b <branch name>``` to
```
git push -u origin <branch name>

Example: git push -u origin MEL-1-setting-up-project
```

To see the branch you are currently on
```
git branch
```

Lastly you can now go into git, find your repositiory you just pushed and create a pull request to the dev branch. Make sure there are no merge conflicts then merge the pull request :)
