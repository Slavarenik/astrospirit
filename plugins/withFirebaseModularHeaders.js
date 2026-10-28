const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

const MODULAR_HEADER_PODS = [
  "pod 'FirebaseCore', :modular_headers => true",
  "pod 'FirebaseCoreInternal', :modular_headers => true",
  "pod 'GoogleUtilities', :modular_headers => true",
];

const MARKER = "Required for Firebase Swift pods with static libraries";

/**
 * Injects `:modular_headers => true` for Firebase/GoogleUtilities into the
 * generated iOS Podfile. Needed because EAS regenerates `ios/` on each build
 * and a hand-edited Podfile would be wiped.
 */
function withFirebaseModularHeaders(config) {
  return withDangerousMod(config, [
    "ios",
    async (cfg) => {
      const podfilePath = path.join(cfg.modRequest.platformProjectRoot, "Podfile");
      let contents = fs.readFileSync(podfilePath, "utf8");
      if (contents.includes(MARKER)) return cfg;

      const snippet = [
        "",
        `  # ${MARKER}`,
        ...MODULAR_HEADER_PODS.map((line) => `  ${line}`),
        "",
      ].join("\n");

      if (contents.includes("use_react_native!(")) {
        contents = contents.replace("use_react_native!(", `${snippet}  use_react_native!(`);
      } else {
        throw new Error(
          "withFirebaseModularHeaders: could not find use_react_native! in Podfile"
        );
      }

      fs.writeFileSync(podfilePath, contents);
      return cfg;
    },
  ]);
}

module.exports = withFirebaseModularHeaders;
