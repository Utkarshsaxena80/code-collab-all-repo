# Local Code Runner Backend

This is a small Express backend that sends Python code to an EC2 machine over SSH, uploads a stdin file when needed, runs the code inside Docker on EC2, and returns the execution output.

## Setup

Install dependencies:

```bash
npm install
```

Create `local/.env` from `local/.env.example`:

```env
PORT=3001
SSH_HOST=your-ec2-public-ip
SSH_USERNAME=ubuntu
SSH_PRIVATE_KEY_PATH=./code-colab.pem
REMOTE_DIRECTORY=/home/ubuntu
DOCKER_IMAGE=python:3.9-alpine
```

Keep the private key out of git. The app reads the key from `SSH_PRIVATE_KEY_PATH`.

## Run

```bash
npm start
```

The server exposes:

```http
POST /run
Content-Type: application/json
```

Example request:

```bash
curl -X POST http://localhost:3001/run \
  -H "Content-Type: application/json" \
  -d '{"code":"name = input()\nprint(\"hello\", name)","fileName":"test.py","stdin":"Hemant"}'
```

Example response:

```json
{
  "output": "hello Hemant\n"
}
```

## Scripts

```bash
npm start
npm run dev
npm run check
```

## Notes

- `server.js` is the only entrypoint.
- Runtime configuration is loaded from `.env`.
- Python filenames are sanitized before upload and execution.
- Temporary local files are cleaned up after each request.
