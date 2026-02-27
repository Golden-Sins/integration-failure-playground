require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Running: http://localhost:${PORT}`);
  console.log(`Docs:    http://localhost:${PORT}/docs`);
  console.log(`PID:     ${process.pid}`);
});