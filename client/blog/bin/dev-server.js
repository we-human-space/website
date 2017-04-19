const project = require('../config/project.config');
const server = require('../server/main');

server.listen(project.server_port);
console.log(`Server is now running at http://localhost:${project.server_port}.`);
