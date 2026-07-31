import { execFileSync } from 'node:child_process';

const branch = execFileSync('git', ['branch', '--show-current'], { encoding: 'utf8' }).trim();
if (branch !== 'main') {
  throw new Error(
    `Despliegue de producción bloqueado: la rama actual es ${branch || 'desconocida'}, se requiere main.`,
  );
}

execFileSync('pnpm', ['build'], { stdio: 'inherit' });
execFileSync(
  'pnpm',
  [
    'exec',
    'wrangler',
    'pages',
    'deploy',
    'dist',
    '--project-name',
    'decisiones-que-si-suman',
    '--branch',
    'main',
  ],
  { stdio: 'inherit' },
);
