const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use('/fragments', express.static(path.join(__dirname, 'fragments')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(bodyParser.json());

let htmlFiles = []

async function scanForHtmlFiles(folderPath) {
    const htmlFiles = [];

    async function recursiveScan(currentPath) {
        const files = await fs.readdir(currentPath);

        for (const file of files) {
            const filePath = path.join(currentPath, file);
            const stats = await fs.stat(filePath);

            if (stats.isDirectory()) {
                await recursiveScan(filePath); // Recursively scan subdirectories
            } else if (file.match(/\.html$|\.xhtml$/)) {
                htmlFiles.push(path.relative(__dirname, filePath));
            }
        }
    }

    await recursiveScan(folderPath);

    // Sort the htmlFiles array naturally
    htmlFiles.sort((a, b) => {
        // Split the file paths into parts separated by slashes
        const partsA = a.split('/');
        const partsB = b.split('/');
        // Get the file names from the last parts
        const fileNameA = partsA[partsA.length - 1];
        const fileNameB = partsB[partsB.length - 1];
        // Extract numeric portions from the file names using regular expressions
        const numA = parseInt(fileNameA.match(/\d+/)[0]);
        const numB = parseInt(fileNameB.match(/\d+/)[0]);
        // Compare the extracted numeric values
        return numA - numB;
    });

    return htmlFiles;
}

app.get('/getHtmlFileList', async (req, res) => {
    const folder = req.query.folder;
    if (!folder) {
        return res.status(400).send("Bad Request");
    }

    const folderPath = path.join(__dirname, 'fragments', folder);
    htmlFiles = await scanForHtmlFiles(folderPath);

    res.json({ htmlFiles }); // Use the length of htmlFiles array
});

app.get('/getHtmlFileStream', async (req, res) => {
    const folder = req.query.folder;
    const page = req.query.page;

    if (!folder || !page) {
        return res.status(400).send("Bad Request");
    }

    // Check if the requested page is within the range of found HTML/XHTML files
    const pageIndex = parseInt(page) - 1;
    if (pageIndex < 0 || pageIndex >= htmlFiles.length) {
        return res.status(404).send("Not Found");
    }

    const filePath = path.join(__dirname, htmlFiles[pageIndex]);

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading HTML file:", err);
            res.status(500).send("Internal Server Error");
        } else {
            res.send(data);
        }
    });
});

app.post('/search', async (req, res) => {
    const searchText = req.body.searchText;
    const selectedFolder = req.body.selectedFolder;

    const folderPath = path.join(__dirname, 'fragments', selectedFolder);
    const htmlFiles = await scanForHtmlFiles(folderPath);

    const results = [];

    for (const file of htmlFiles) {
        const filePath = path.join(__dirname, file);
        const fileContent = await fs.promises.readFile(filePath, 'utf8');

        // Count matches for the search text in the file content
        const matches = (fileContent.match(new RegExp(searchText, 'gi')) || []).length;

        if (matches > 0) {
            results.push({ file, count: matches });
        }
    }

    // Send the search results back to the client
    res.json({ results });
});

app.get('/getFolders', (req, res) => {
    fs.readdir(path.join(__dirname, 'fragments'), (err, files) => {
        if (err) {
            console.error("Error reading 'fragments' directory:", err);
            res.status(500).send("Internal Server Error");
        } else {
            const folders = files.filter(file => fs.statSync(path.join(__dirname, 'fragments', file)).isDirectory());
            res.json({ folders });
        }
    });
});

app.listen(PORT, '127.0.0.1', () => {
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
});
