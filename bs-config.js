module.exports = {
  port: 3002,
  server: {
    baseDir: './node_modules/cnchar-data',
    middleware: [
      {
        route: '',
        handle: function (req, res, next) {
          // 设置CORS头
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
          
          // 处理预检请求
          if (req.method === 'OPTIONS') {
            res.statusCode = 200;
            res.end();
            return;
          }
          
          next();
        }
      }
    ]
  },
  files: ['./node_modules/cnchar-data/**/*.json'],
  open: false,
  notify: false
};