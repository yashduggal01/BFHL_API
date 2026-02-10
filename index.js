const express = require("express");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();

const server = express();
server.use(express.json());

const studentEmail = "yash2247.be23@chitkara.edu.in";

function sendFail(res, code, msg) {
  return res.status(code).json({
    is_success: false,
    official_email: studentEmail,
    data: msg
  });
}

function findGcd(a, b) {
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return Math.abs(a);
}

function findLcm(a, b) {
  return Math.abs(a * b) / findGcd(a, b);
}

server.get("/health", (req, res) => {
  res.status(200).json({
    is_success: true,
    official_email: studentEmail
  });
});

server.post("/bfhl", async (req, res) => {
  try {

    const bodyKeys = Object.keys(req.body);

    if (bodyKeys.length !== 1) {
      return sendFail(res, 400, "Exactly one input is required");
    }

    const operation = bodyKeys[0];
    const input = req.body[operation];

    let result;

    switch (operation) {

      case "fibonacci":
        if (!Number.isInteger(input) || input < 0) {
          return sendFail(res, 400, "Invalid fibonacci input");
        }

        result = [];
        for (let i = 0; i < input; i++) {
          if (i === 0) result.push(0);
          else if (i === 1) result.push(1);
          else result.push(result[i - 1] + result[i - 2]);
        }
        break;

      case "prime":
        if (!Array.isArray(input)) {
          return sendFail(res, 400, "Prime input must be an array");
        }

        result = input.filter(n => {
          if (!Number.isInteger(n) || n < 2) return false;
          for (let i = 2; i * i <= n; i++) {
            if (n % i === 0) return false;
          }
          return true;
        });
        break;

      case "lcm":
        if (!Array.isArray(input) || input.length === 0) {
          return sendFail(res, 400, "LCM input must be non empty");
        }

        result = input.reduce((acc, n) => {
          if (!Number.isInteger(n)) throw new Error();
          return findLcm(acc, n);
        });
        break;

      case "hcf":
        if (!Array.isArray(input) || input.length === 0) {
          return sendFail(res, 400, "HCF input must be non empty array");
        }

        result = input.reduce((acc, n) => {
          if (!Number.isInteger(n)) throw new Error();
          return findGcd(acc, n);
        });
        break;

      case "AI":
        if (typeof input !== "string" || input.trim() === "") {
          return sendFail(res, 400, "AI input must be a string");
        }

        const aiCall = await axios.post(
`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,

          {
            contents: [
              {
                parts: [
                  {
                    text: `Answer the following question in EXACTLY ONE WORD.
Do not add punctuation.
Do not add explanation.
If unsure, still respond with one word only.

Question: ${input}`
                  }
                ]
              }
            ]
          }
        );

        let reply =
          aiCall.data.candidates?.[0]?.content?.parts?.[0]?.text || "Unknown";

        result = reply
          .trim()
          .replace(/[^A-Za-z0-9]/g, "")
          .split(/\s+/)[0];

        break;

      default:
        return sendFail(res, 400, "Unsupported key");
    }

    return res.status(200).json({
      is_success: true,
      official_email: studentEmail,
      data: result
    });

  } catch (e) {
    console.log("server error:", e.message);
    return sendFail(res, 500, "There is problem in server");
  }
});

const runningPort = process.env.PORT || 3000;
server.listen(runningPort, () => {
  console.log("Server started on port", runningPort);
});
