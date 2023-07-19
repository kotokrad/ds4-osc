import * as ds from "dualshock";
import { Bundle, Client, Server } from "node-osc";
import dotenv from "dotenv";

dotenv.config();

const CLIENT_HOST = process.env.CLIENT_HOST || "127.0.0.1";
const CLIENT_PORT = Number(process.env.CLIENT_PORT) || 12000;

const SERVER_HOST = process.env.SERVER_HOST || "127.0.0.1";
const SERVER_PORT = Number(process.env.SERVER_PORT) || 9000;

const devices = ds.getDevices();

if (devices.length === 0) {
  console.log("No devices found.");
  process.exit();
}

const gamepad = ds.open(devices[0]);

console.log(`Found device: ${devices[0].product} [${devices[0].serialNumber}]`);
console.log(`Battery: ${(gamepad.map.status.battery / 16) * 100}%`);

const client = new Client(CLIENT_HOST, CLIENT_PORT);
const server = new Server(SERVER_PORT, SERVER_HOST, () => {
  console.log(`OSC Server is listening on ${SERVER_HOST}:${SERVER_PORT}`);
});

console.log(`OSC Client: ${CLIENT_HOST}:${CLIENT_PORT}`);

const updateHandler = () => {
  const bundle = new Bundle();

  // Touchpad (touch 1)
  if (gamepad.digital.t1) {
    bundle.append(["/ds4/touchpad/touch1/active", true]);
    bundle.append([
      "/ds4/touchpad/touch1/position",
      gamepad.analog.t1X,
      gamepad.analog.t1Y,
    ]);
  } else {
    bundle.append(["/ds4/touchpad/touch1/active", false]);
  }

  // Touchpad (touch 2)
  if (gamepad.digital.t2) {
    bundle.append(["/ds4/touchpad/touch2/active", true]);
    bundle.append([
      "/ds4/touchpad/touch2/position",
      gamepad.analog.t2X,
      gamepad.analog.t2Y,
    ]);
  } else {
    bundle.append(["/ds4/touchpad/touch2/active", false]);
  }

  // Motion
  bundle.append(["/ds4/motion/x", gamepad.motion.accelX]);
  bundle.append(["/ds4/motion/y", gamepad.motion.accelY]);
  bundle.append(["/ds4/motion/z", gamepad.motion.accelZ]);
  bundle.append(["/ds4/motion/pitch", gamepad.motion.gyroPitch]);
  bundle.append(["/ds4/motion/yaw", gamepad.motion.gyroYaw]);
  bundle.append(["/ds4/motion/roll", gamepad.motion.gyroRoll]);

  // Send OSC message
  client.send(bundle);
};

gamepad.onmotion = true;
gamepad.onstatus = true;
gamepad.onupdate = updateHandler;

// OSC Server
server.on("message", (message) => {
  const [path, ...values] = message;
  console.log("👾", "message =>", message);

  // RGB 0-255
  // TODO: test with Chataigne's color value
  if (path === "/ds4/color" && values.length === 3) {
    gamepad.setLed(...values);
    return;
  }

  // Left, Right 0-255
  if (path === "/ds4/rumble" && values.length === 2) {
    gamepad.rumble(...values);
    return;
  }
});
