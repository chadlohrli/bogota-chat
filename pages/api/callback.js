
export default function handler(req, res) {
  console.log("Callback")
  Callback(req, res);
}

async function Callback(req, res) {
  console.log(req.body)
  return res.status(200).send();
}
