export const config = {
  runtime: 'nodejs20.x',
};

export default function handler(req, res) {
  res.status(200).json({ message: 'Test function works!', url: req.url, query: req.query });
}
