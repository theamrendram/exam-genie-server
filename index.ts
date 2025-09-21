import dotenv from "dotenv";
import app from "./src/app";
import "./src/utils/worker";

dotenv.config();
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
