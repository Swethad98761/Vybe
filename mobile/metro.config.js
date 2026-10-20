const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);
const upstream = config.resolver.resolveRequest;

// Keep Expo's package-exports resolver on so supabase-js 2.115 can pick its
// react-native CJS build. Forcing exports off made Metro load index.mjs and
// fail on realtime-js's extensionless internals.

const lookupFrom = [__dirname, path.resolve(__dirname, "..")];

function nobleDir(pkg) {
  try {
    return path.dirname(require.resolve(`${pkg}/package.json`, { paths: lookupFrom }));
  } catch {
    return path.join(__dirname, "node_modules", pkg);
  }
}

function nobleFile(moduleName) {
  const specs = moduleName.endsWith(".js") ? [moduleName, moduleName.slice(0, -3)] : [moduleName, `${moduleName}.js`];
  for (const spec of specs) {
    try {
      return require.resolve(spec, { paths: lookupFrom });
    } catch {
      /* try next */
    }
  }
  return null;
}

config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules ?? {}),
  "@noble/hashes": nobleDir("@noble/hashes"),
  "@noble/ciphers": nobleDir("@noble/ciphers"),
  "@noble/curves": nobleDir("@noble/curves"),
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "qrcode") {
    return {
      type: "sourceFile",
      filePath: require.resolve("qrcode/lib/browser.js", { paths: [__dirname] }),
    };
  }
  if (moduleName === "@supabase/supabase-js") {
    return {
      type: "sourceFile",
      filePath: require.resolve("@supabase/supabase-js/dist/index.cjs", { paths: [__dirname] }),
    };
  }
  if (moduleName.startsWith("@noble/")) {
    const filePath = nobleFile(moduleName);
    if (filePath) {
      return { type: "sourceFile", filePath };
    }
  }
  if (upstream) {
    return upstream(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
