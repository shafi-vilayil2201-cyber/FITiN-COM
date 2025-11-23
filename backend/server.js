const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();
const cors = require('cors');

// Enable CORS with specific options if needed, or default to allow all
server.use(cors());
server.use(middlewares);

// Rewrite rules if needed (optional, but good for flexibility)
server.use(jsonServer.rewriter({
  '/api/*': '/$1'
}));

server.use(router);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`JSON Server is running on port ${PORT}`);
});
