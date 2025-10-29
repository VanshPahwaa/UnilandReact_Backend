const fs=require("fs")
const path=require("path")
export const propertyTypes = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../data/propertyTypes.json"))
);