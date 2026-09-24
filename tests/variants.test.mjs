import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync, writeFileSync, mkdirSync, cpSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCRIPT = path.join(ROOT, 'scripts', 'build_variants.py');

function runCheck(dirName) {
  // build_variants.py resuelve rutas relativas a scripts/..; se le apunta con un repo temporal
  return execFileSync('python3', [SCRIPT, '--check'], {
    cwd: dirName ? path.join(ROOT, dirName) : ROOT,
    encoding: 'utf8',
  });
}

test('VARIANTS: convención válida cuando principal + variante están en ambas carpetas', () => {
  // El repo real no tiene variantes aún: el check debe salir limpio
  const out = runCheck();
  assert.match(out, /OK/);
});

test('VARIANTS: valida convención en un árbol temporal simulado', () => {
  const tmp = path.join(ROOT, '.tmp-variants-test');
  mkdirSync(path.join(tmp, 'scripts'), { recursive: true });
  mkdirSync(path.join(tmp, 'images', 'thumbs'), { recursive: true });
  mkdirSync(path.join(tmp, 'images', 'catalog'), { recursive: true });
  cpSync(SCRIPT, path.join(tmp, 'scripts', 'build_variants.py'));

  try {
    // Par completo: pasa
    writeFileSync(path.join(tmp, 'images', 'thumbs', 'VM-X_vela.jpg'), 'x');
    writeFileSync(path.join(tmp, 'images', 'catalog', 'VM-X_vela.jpg'), 'x');
    writeFileSync(path.join(tmp, 'images', 'thumbs', 'VM-X_vela-v2.jpg'), 'x');
    writeFileSync(path.join(tmp, 'images', 'catalog', 'VM-X_vela-v2.jpg'), 'x');

    let out = execFileSync('python3', ['scripts/build_variants.py', '--check'], {
      cwd: tmp, encoding: 'utf8',
    });
    assert.match(out, /1 productos con variantes/);
    assert.match(out, /VM-X_vela-v2/);

    // Romper el par: falla señalando la huérfana
    rmSync(path.join(tmp, 'images', 'catalog', 'VM-X_vela-v2.jpg'));
    assert.throws(() => {
      execFileSync('python3', ['scripts/build_variants.py', '--check'], {
        cwd: tmp, encoding: 'utf8', stdio: 'pipe',
      });
    });
    const stderr = (() => {
      try {
        execFileSync('python3', ['scripts/build_variants.py', '--check'], {
          cwd: tmp, encoding: 'utf8', stdio: 'pipe',
        });
        return '';
      } catch (e) {
        return String(e.stderr || '') + String(e.stdout || '');
      }
    })();
    assert.match(stderr, /sin contraparte en catalog: VM-X_vela-v2\.jpg/);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('VARIANTS: variants.json coherente si existe (claves son files reales del catálogo)', () => {
  const jsonPath = path.join(ROOT, 'js', 'variants.json');
  if (!existsSync(jsonPath)) return; // sin variantes aún, nada que validar
  const variants = JSON.parse(readFileSync(jsonPath, 'utf8'));
  const app = readFileSync(path.join(ROOT, 'js', 'app.js'), 'utf8');
  for (const [base, extras] of Object.entries(variants)) {
    assert.ok(
      app.includes(`file: "${base}"`),
      `la base ${base} debe existir como file: en app.js`
    );
    assert.ok(Array.isArray(extras) && extras.length >= 1, `${base} debe tener variantes`);
    for (const extra of extras) {
      assert.match(extra, /^.+\.jpg$/);
      assert.ok(
        existsSync(path.join(ROOT, 'images', 'thumbs', extra)),
        `falta images/thumbs/${extra}`
      );
      assert.ok(
        existsSync(path.join(ROOT, 'images', 'catalog', extra)),
        `falta images/catalog/${extra}`
      );
    }
  }
});
