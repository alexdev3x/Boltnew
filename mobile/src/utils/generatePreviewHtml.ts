import type { ProjectFile } from '../store/chatStore';
import BABEL_VENDOR from './vendor/babel';
import REACT_AND_REACT_DOM_VENDOR from './vendor/reactAndReactDom';

function normalize(path: string) {
  return path.replace(/^\.?\//, '').replace(/^\/+/, '');
}

function resolveEntryPath(files: ProjectFile[]): string {
  const appFile = files.find((file) => /(^|\/)App\.(tsx|ts|jsx|js)$/i.test(file.path));
  if (appFile) return appFile.path;

  const codeFile = files.find((file) => /\.(tsx|ts|jsx|js)$/i.test(file.path));
  return (codeFile ?? files[0]).path;
}

const RUNTIME_SCRIPT = `
(function () {
  function showError(err) {
    var root = document.getElementById('root');
    root.innerHTML = '';
    var box = document.createElement('div');
    box.style.cssText =
      'font-family:Menlo,Consolas,monospace;color:#ff8080;background:#1a0000;' +
      'padding:16px;white-space:pre-wrap;font-size:12px;line-height:1.5;height:100%;' +
      'overflow:auto;box-sizing:border-box;';
    box.textContent = err && err.stack ? String(err.stack) : String(err);
    root.appendChild(box);
  }

  try {
    var files = window.__BOLT_FILES__;
    var entry = window.__BOLT_ENTRY__;
    var React = window.React;
    var ReactDOM = window.ReactDOM;

    function findFile(rawPath) {
      var clean = rawPath.replace(/^\\/+/, '');
      var candidates = [clean, clean + '.tsx', clean + '.ts', clean + '.jsx', clean + '.js',
        clean + '/index.tsx', clean + '/index.ts', clean + '/index.jsx', clean + '/index.js'];
      for (var i = 0; i < candidates.length; i++) {
        for (var key in files) {
          if (key.replace(/^\\/+/, '') === candidates[i]) return key;
        }
      }
      return null;
    }

    function resolveRelative(fromPath, request) {
      var baseParts = fromPath.replace(/^\\/+/, '').split('/');
      baseParts.pop();
      var relParts = request.split('/');
      for (var i = 0; i < relParts.length; i++) {
        var part = relParts[i];
        if (part === '' || part === '.') continue;
        if (part === '..') baseParts.pop();
        else baseParts.push(part);
      }
      return baseParts.join('/');
    }

    function flattenStyle(style) {
      if (!style) return {};
      if (Array.isArray(style)) {
        return style.reduce(function (acc, s) {
          return Object.assign(acc, flattenStyle(s));
        }, {});
      }
      if (typeof style === 'object') return Object.assign({}, style);
      return {};
    }

    function makeIconStub(defaultGlyph) {
      return function (props) {
        return React.createElement(
          'span',
          {
            style: {
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: (props && props.size) || 16,
              color: (props && props.color) || 'currentColor',
              lineHeight: 1,
            },
          },
          defaultGlyph,
        );
      };
    }

    function buildReactNative() {
      var View = function (props) {
        return React.createElement(
          'div',
          {
            style: Object.assign(
              { display: 'flex', flexDirection: 'column', position: 'relative', flexShrink: 0 },
              flattenStyle(props.style),
            ),
            onClick: props.onClick,
          },
          props.children,
        );
      };

      var Text = function (props) {
        return React.createElement(
          'span',
          {
            style: Object.assign(
              { display: 'block', fontFamily: 'inherit', color: 'inherit' },
              flattenStyle(props.style),
            ),
          },
          props.children,
        );
      };

      var TextInput = function (props) {
        var Tag = props.multiline ? 'textarea' : 'input';
        return React.createElement(Tag, {
          value: props.value,
          placeholder: props.placeholder,
          style: Object.assign(
            {
              fontFamily: 'inherit',
              fontSize: 14,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              color: (props.style && flattenStyle(props.style).color) || 'inherit',
            },
            flattenStyle(props.style),
          ),
          onChange: function (e) {
            if (props.onChangeText) props.onChangeText(e.target.value);
          },
          onKeyDown: function (e) {
            if (e.key === 'Enter' && props.onSubmitEditing) props.onSubmitEditing();
          },
        });
      };

      var Pressable = function (props) {
        var resolvedStyle = typeof props.style === 'function' ? props.style({ pressed: false }) : props.style;
        return React.createElement(
          'div',
          {
            style: Object.assign(
              { display: 'flex', cursor: 'pointer', flexShrink: 0 },
              flattenStyle(resolvedStyle),
            ),
            onClick: props.onPress,
          },
          props.children,
        );
      };

      var ScrollView = function (props) {
        return React.createElement(
          'div',
          {
            style: Object.assign(
              {
                display: 'flex',
                flexDirection: props.horizontal ? 'row' : 'column',
                overflow: 'auto',
              },
              flattenStyle(props.style),
              flattenStyle(props.contentContainerStyle),
            ),
          },
          props.children,
        );
      };

      var FlatList = function (props) {
        var data = props.data || [];
        return React.createElement(
          'div',
          {
            style: Object.assign(
              { display: 'flex', flexDirection: props.horizontal ? 'row' : 'column', overflow: 'auto', flex: 1 },
              flattenStyle(props.contentContainerStyle),
            ),
          },
          data.map(function (item, index) {
            var key = props.keyExtractor ? props.keyExtractor(item, index) : String(index);
            return React.createElement(React.Fragment, { key: key }, props.renderItem({ item: item, index: index }));
          }),
        );
      };

      var SafeAreaView = function (props) {
        return React.createElement(
          'div',
          { style: Object.assign({ display: 'flex', flexDirection: 'column', flex: 1 }, flattenStyle(props.style)) },
          props.children,
        );
      };

      var Image = function (props) {
        var uri = props.source && typeof props.source === 'object' ? props.source.uri : undefined;
        return React.createElement('img', {
          src: uri,
          style: Object.assign({ display: 'block' }, flattenStyle(props.style)),
        });
      };

      var ActivityIndicator = function (props) {
        return React.createElement(
          'span',
          { style: { color: props.color || '#999', fontSize: 12 } },
          '...',
        );
      };

      var KeyboardAvoidingView = View;
      var TouchableOpacity = Pressable;
      var TouchableHighlight = Pressable;

      var StyleSheet = {
        create: function (styles) {
          return styles;
        },
        flatten: flattenStyle,
        absoluteFillObject: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
      };

      var Platform = {
        OS: 'web',
        select: function (obj) {
          return obj.web !== undefined ? obj.web : obj.default;
        },
      };

      var Dimensions = {
        get: function () {
          return { width: window.innerWidth, height: window.innerHeight };
        },
      };

      return {
        View: View,
        Text: Text,
        TextInput: TextInput,
        Pressable: Pressable,
        ScrollView: ScrollView,
        FlatList: FlatList,
        SafeAreaView: SafeAreaView,
        Image: Image,
        ActivityIndicator: ActivityIndicator,
        KeyboardAvoidingView: KeyboardAvoidingView,
        TouchableOpacity: TouchableOpacity,
        TouchableHighlight: TouchableHighlight,
        StyleSheet: StyleSheet,
        Platform: Platform,
        Dimensions: Dimensions,
        Alert: {
          alert: function (title, message) {
            window.alert(message ? title + '\\n' + message : title);
          },
        },
        StatusBar: function () {
          return null;
        },
      };
    }

    var RN = buildReactNative();
    var moduleCache = {};

    function requireModule(request, fromPath) {
      if (request === 'react') return React;
      if (request === 'react-dom') return ReactDOM;
      if (request === 'react-native' || request === 'react-native-web') return RN;
      if (request === 'react-native-safe-area-context') {
        return {
          SafeAreaView: RN.SafeAreaView,
          SafeAreaProvider: function (props) {
            return React.createElement(React.Fragment, null, props.children);
          },
          useSafeAreaInsets: function () {
            return { top: 0, bottom: 0, left: 0, right: 0 };
          },
        };
      }
      if (request === '@expo/vector-icons') {
        var stub = makeIconStub('\\u25CF');
        return new Proxy(
          {},
          {
            get: function () {
              return stub;
            },
          },
        );
      }
      if (request.charAt(0) === '.') {
        var resolved = resolveRelative(fromPath, request);
        var found = findFile(resolved);
        if (!found) throw new Error('Cannot resolve module "' + request + '" from ' + fromPath);
        return loadModule(found);
      }
      return {};
    }

    function loadModule(path) {
      if (moduleCache[path]) return moduleCache[path].exports;
      var source = files[path];
      if (source == null) throw new Error('Module not found: ' + path);

      var mod = { exports: {} };
      moduleCache[path] = mod;

      var compiled;
      try {
        compiled = Babel.transform(source, {
          filename: path,
          presets: [
            ['typescript', { isTSX: true, allExtensions: true }],
            ['react', { runtime: 'classic' }],
            ['env', { modules: 'commonjs' }],
          ],
        }).code;
      } catch (e) {
        throw new Error('Compile error in ' + path + ': ' + e.message);
      }

      var fn = new Function('module', 'exports', 'require', 'React', compiled);
      fn(mod, mod.exports, function (req) {
        return requireModule(req, path);
      }, React);
      return mod.exports;
    }

    var entryExports = loadModule(entry);
    var App = entryExports.default || entryExports.App || entryExports;
    if (typeof App !== 'function') {
      throw new Error('No default-exported component found in ' + entry);
    }

    var root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(React.createElement(App));
  } catch (err) {
    showError(err);
  }
})();
`;

// Guards against embedded code prematurely closing an inline <script> tag
// when it contains the literal text "</script" (e.g. inside a string or comment).
function escapeForInlineScript(code: string): string {
  return code.replace(/<\/(script)/gi, '<\\/$1');
}

export function buildPreviewDocument(files: ProjectFile[]): string {
  const codeFiles = files.filter((file) => /\.(tsx|ts|jsx|js)$/i.test(file.path));
  if (codeFiles.length === 0) return '';

  const entry = resolveEntryPath(codeFiles);
  const filesMap: Record<string, string> = {};
  for (const file of codeFiles) {
    filesMap[normalize(file.path)] = file.content;
  }

  const bootstrap = `window.__BOLT_FILES__ = ${JSON.stringify(filesMap)};\nwindow.__BOLT_ENTRY__ = ${JSON.stringify(normalize(entry))};`;

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
    <style>
      html, body, #root { height: 100%; margin: 0; padding: 0; background: #0A0A0A; }
      * { box-sizing: border-box; }
      body { font-family: -apple-system, system-ui, Roboto, sans-serif; color: #fff; }
    </style>
  </head>
  <body>
    <div id="root">
      <div style="display:flex;align-items:center;justify-content:center;height:100%;color:#737373;font-size:12px;">
        Loading preview…
      </div>
    </div>
    <script>${escapeForInlineScript(REACT_AND_REACT_DOM_VENDOR)}</script>
    <script>${escapeForInlineScript(BABEL_VENDOR)}</script>
    <script>${escapeForInlineScript(bootstrap)}</script>
    <script>${escapeForInlineScript(RUNTIME_SCRIPT)}</script>
  </body>
</html>`;
}
