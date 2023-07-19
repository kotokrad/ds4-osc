{
  description = "node gamepad";
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/master";
  inputs.flake-utils.url = "github:numtide/flake-utils";

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShell = pkgs.mkShell {
          nativeBuildInputs = with pkgs; [
            bashInteractive
            pkg-config
          ];
          buildInputs = with pkgs; [
            hidapi
            libusb1
            libusb
            libudev-zero
          ];
          shellHook = ''
            export LD_LIBRARY_PATH=$NIX_LD_LIBRARY_PATH
          '';
        };
      });
}
