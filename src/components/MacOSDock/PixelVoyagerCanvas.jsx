import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import React, { useRef, useEffect } from 'react';
export default function PixelVoyagerCanvas() {
    const mountRef = useRef(null);

    useEffect(() => {
        if (!mountRef.current) return;

        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.z = 25;
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        mountRef.current.appendChild(renderer.domElement);

        const mouse = new THREE.Vector2(0, 0);
        const clock = new THREE.Clock();

        // Post-processing for bloom effect
        const renderScene = new RenderPass(scene, camera);
        const bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 1.5, 0.4, 0.85);
        bloomPass.threshold = 0;
        bloomPass.strength = 1.2;
        bloomPass.radius = 0;
        const composer = new EffectComposer(renderer);
        composer.addPass(renderScene);
        composer.addPass(bloomPass);

        // --- Starfield ---
        const starGeometry = new THREE.BufferGeometry();
        const starVertices = [];
        for (let i = 0; i < 1500; i++) {
            starVertices.push(
                (Math.random() - 0.5) * 100,
                (Math.random() - 0.5) * 100,
                (Math.random() - 0.5) * 100
            );
        }
        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
        const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });
        scene.add(new THREE.Points(starGeometry, starMaterial));

        // --- Pixel Rocket ---
        const rocket = new THREE.Group();
        const pixelSize = 0.2;
        const pixelGeo = new THREE.BoxGeometry(pixelSize, pixelSize, pixelSize);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x00aaff, flatShading: true });
        const wingMat = new THREE.MeshStandardMaterial({ color: 0x0055ff, flatShading: true });
        const cockpitMat = new THREE.MeshStandardMaterial({ color: 0x87ceeb, emissive: 0x87ceeb, emissiveIntensity: 0.5 });

        for (let y = -4; y < 5; y++)
            for (let x = -2; x < 3; x++) {
                if (Math.abs(x) === 2 && y > 1) continue;
                const pixel = new THREE.Mesh(pixelGeo, bodyMat);
                pixel.position.set(x * pixelSize, y * pixelSize, 0);
                rocket.add(pixel);
            }
        for (let y = -3; y < -1; y++)
            for (let x = -4; x < -2; x++) {
                const pixelL = new THREE.Mesh(pixelGeo, wingMat);
                pixelL.position.set(x * pixelSize, y * pixelSize, 0);
                rocket.add(pixelL);
                const pixelR = new THREE.Mesh(pixelGeo, wingMat);
                pixelR.position.set(-x * pixelSize, y * pixelSize, 0);
                rocket.add(pixelR);
            }
        const cockpit = new THREE.Mesh(pixelGeo, cockpitMat);
        cockpit.position.set(0, 3 * pixelSize, pixelSize);
        rocket.add(cockpit);
        scene.add(rocket);

        // --- Rocket Trail (Object Pooling) ---
        const trailPool = [];
        let trailIndex = 0;
        const trailSize = 200;
        const trailGeo = new THREE.BoxGeometry(pixelSize * 1.5, pixelSize * 1.5, pixelSize * 1.5);
        for (let i = 0; i < trailSize; i++) {
            const trailMat = new THREE.MeshBasicMaterial({ color: Math.random() > 0.5 ? 0xff00ff : 0xee82ee });
            const particle = new THREE.Mesh(trailGeo, trailMat);
            particle.visible = false;
            scene.add(particle);
            trailPool.push(particle);
        }

        // --- Crypto Coins ---
        const coinGroup = new THREE.Group();
        const coinMat = new THREE.MeshStandardMaterial({ color: 0xffd700, flatShading: true });
        for (let i = 0; i < 20; i++) {
            const coin = new THREE.Group();
            for (let p = 0; p < 15; p++) {
                const pixel = new THREE.Mesh(pixelGeo, coinMat);
                const angle = (p / 15) * Math.PI * 2;
                pixel.position.set(Math.cos(angle) * 0.4, Math.sin(angle) * 0.4, 0);
                coin.add(pixel);
            }
            coin.position.set(
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 30,
                (Math.random() - 0.5) * 20
            );
            coinGroup.add(coin);
        }
        scene.add(coinGroup);

        const handleMouseMove = event => {
            const rect = mountRef.current?.getBoundingClientRect();
            if (!rect) return;
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        };
        window.addEventListener('mousemove', handleMouseMove);

        let animationId;
        const animate = () => {
            animationId = requestAnimationFrame(animate);
            const delta = clock.getDelta();
            const elapsedTime = clock.getElapsedTime();

            const targetPosition = new THREE.Vector3(mouse.x * 15, mouse.y * 10, 0);
            rocket.position.lerp(targetPosition, 0.05);
            rocket.rotation.y = (targetPosition.x - rocket.position.x) * 0.1;
            rocket.rotation.x = -(targetPosition.y - rocket.position.y) * 0.1;

            if (Math.random() > 0.3) {
                const particle = trailPool[trailIndex];
                particle.position.copy(rocket.position);
                particle.position.y -= 0.7;
                particle.scale.setScalar(1);
                particle.visible = true;
                particle.life = 1;
                trailIndex = (trailIndex + 1) % trailSize;
            }

            trailPool.forEach(p => {
                if (p.visible) {
                    p.life -= delta * 1.5;
                    p.scale.setScalar(Math.max(0, p.life));
                    if (p.life <= 0) p.visible = false;
                }
            });

            coinGroup.children.forEach((coin, i) => {
                coin.rotation.z = elapsedTime * (i % 2 === 0 ? 1 : -1);
            });

            composer.render();
        };
        animate();

        const handleResize = () => {
            if (!mountRef.current) return;
            const w = mountRef.current.clientWidth;
            const h = mountRef.current.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
            composer.setSize(w, h);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
                mountRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, []);

    return <div ref={mountRef} className="absolute inset-0 z-0" />;
};
