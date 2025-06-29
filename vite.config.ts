import path from 'node:path';

import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';



// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    return {
        define: {
            'process.env.API_HOST': JSON.stringify(env.API_HOST),
        },
        resolve: {
            alias: {
                '@pages': path.resolve(__dirname, './src/pages'),
                '@components': path.resolve(__dirname, './src/components'),
                '@layouts': path.resolve(__dirname, './src/layouts'),
                '@services': path.resolve(__dirname, './src/services'),
                '@store': path.resolve(__dirname, './src/store'),
                '@styles': path.resolve(__dirname, './src/styles'),
                '@utils': path.resolve(__dirname, './src/utils'),
                '@hooks': path.resolve(__dirname, './src/hooks'),
                '@ui': path.resolve(__dirname, './src/ui'),
                '@app-types': path.resolve(__dirname, './src/types'),
                '@constants': path.resolve(__dirname, './src/constants'),
            },
        },
        plugins: [react()],
    };
});
