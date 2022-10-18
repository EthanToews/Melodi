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
First you will want to clone your the most upto date branch (ie the "main" branch):
```
git clone -b main https://github.com/EthanToews/Melodi.git
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
```
git checkout -b <branch name>
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

Now you are ready to push to the git repository!! 
Make sure to push to the same branch you did ```git checkout -b <branch name>``` to
```
git push -u origin <branch name>
```

To see the branch you are currently on
```
git branch
```
