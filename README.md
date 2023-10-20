# HTML Browser

Lets you browse multiple HTML files with the same ease as you would with any other document.

### Features

* Search engine: Find the text you need.
* Recursive scanning and parsing: Load any web project, no longer worry about relative paths!

### Usage

Create a folder named *fragments* in the root directory, store there your web projects or HTML files in subfolders.

```
.
├── fragments
│   ├── <name>
│   │   ├── 1.xhtml
│   │   ├── 2.xhtml
│   │   ├── ...
│   │   └── n.xhtml
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
