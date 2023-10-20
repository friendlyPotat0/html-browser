# HTML Browser

Lets you browse multiple HTML files with the same ease as you would with any other document.

### Features

* Search engine: Find the text you need.
* Recursive scanning and parsing: Load any web project, no longer worry about relative paths!
* Natural sorting: Your files are displayed according to their filename based on the natural sorting algorithm.

### Usage

Create a folder named *fragments* in the root directory, store there your web projects or HTML files in subfolders. Example:

```
.
├── fragments
│   ├── <name>
│   │   ├── 1.html
│   │   ├── 2.html
│   │   ├── ...
│   │   └── n.html
│   └── <name>
│       ├── images
│       │   └── resource.jpg
│       ├── style
│       │   └── stylesheet.css
│       └── xhtml
│           ├── 1.xhtml
│           ├── 2.xhtml
│           ├── ...
│           └── n.xhtml
├── package.json
├── package-lock.json
├── public/
├── README.md
└── server.js
```

### Run

`node server.js`

### TODO

Go to the *Projects* tab of this repo in GitHub.
