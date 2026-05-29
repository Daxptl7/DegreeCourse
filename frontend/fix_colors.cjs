const fs = require('fs');

const file = '/Users/daxpatel/Desktop/Degree/UnilearnPDEU/frontend/src/dashboards/common/SchoolSLS.css';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/#0b5edd/gi, 'var(--primary-theme)');
content = content.replace(/#1a3a6b/gi, 'var(--primary-theme)');
content = content.replace(/#A6192E/gi, 'var(--primary-theme)');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed colors in SchoolSLS.css');
