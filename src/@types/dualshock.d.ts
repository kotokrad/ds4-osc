declare module "dualshock" {
  interface Device {
    vendorId: number;
    productId: number;
    path: string;
    serialNumber: string;
    manufacturer: string;
    product: string;
    release: number;
    interface: number;
    usagePage: number;
    usage: number;
    type: "ds3" | "ds4";
    style: "old" | "new";
    mode: "usb" | "bluetooth";
  }

  type LedState = [red: number, green: number, blue: number];
  type RumbleState = [left: number, right: number];
  type VolState = [left: number, right: number, mic: number, speaker: number];

  class Gamepad extends EventEmitter {
    write();
    getFeatureReport();
    sendFeatureReport();
    setNonBlocking();
    readSync();
    readTimeout();
    getDeviceInfo(): Device;
    rPowL: number;
    rPowR: number;
    ledState: LedState;
    vol: VolState;
    parser();
    rumble(...state: RumbleState);
    rumbleAdd(...state: RumbleState);
    setLed(...state: LedState);
    setVolume(...state: VolState);
    sound();
    type: Device["type"];
    style: Device["style"];
    mode: Device["mode"];
    onupdate();
    onmotion: boolean | Function;
    onstatus: boolean | Function;

    digital: {
      cross: boolean;
      circle: boolean;
      square: boolean;
      triangle: boolean;
      a: boolean;
      b: boolean;
      x: boolean;
      y: boolean;
      up: boolean;
      down: boolean;
      left: boolean;
      right: boolean;
      l1: boolean;
      l2: boolean;
      l3: boolean;
      r1: boolean;
      r2: boolean;
      r3: boolean;
      select: boolean;
      start: boolean;
      ps: boolean;
      pad: boolean;
      t1: boolean;
      t2: boolean;
    };

    analog: {
      lStickX: number;
      lStickY: number;
      rStickX: number;
      rStickY: number;
      l2: number;
      r2: number;
      t1X: number;
      t1Y: number;
      t2X: number;
      t2Y: number;
    };

    motion: {
      accelX: number;
      accelY: number;
      accelZ: number;
      gyroRoll: number;
      gyroYaw: number;
      gyroPitch: number;
    };

    map: {
      status: { audio: any; battery: number };
    };

    status: { audio: any; battery: number };
  }

  function getDevices(): Device[];
  function open(device: Device): Gamepad;
}
