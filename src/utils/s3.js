import AWS from "aws-sdk";
import {
  AWS_ACCESS_KEY,
  AWS_S3_REGION,
  AWS_SECRET_ACCESS_KEY,
} from "../config";

const S3 = new AWS.S3({
  signatureVersion: "v4",
  region: AWS_S3_REGION,
  accessKeyId: AWS_ACCESS_KEY,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
});

export default S3;
