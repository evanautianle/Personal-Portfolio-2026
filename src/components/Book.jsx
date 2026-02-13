import { useCursor, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useAtom } from "jotai";
import { easing } from "maath";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bone,
  BoxGeometry,
  Color,
  Float32BufferAttribute,
  MathUtils,
  MeshStandardMaterial,
  Skeleton,
  SkinnedMesh,
  SRGBColorSpace,
  Uint16BufferAttribute,
  Vector3,
} from "three";
import { degToRad } from "three/src/math/MathUtils.js";
import { pageAtom, pages } from "./UI";

const easingFactor = 0.5;
const easingFactorFold = 0.3;
const insideCurveStrength = 0.18;
const outsideCurveStrength = 0.05;
const turningCurveStrength = 0.09;
const PAGE_WIDTH = 1.28;
const PAGE_HEGHT = 1.71;
const PAGE_DEPTH = 0.003;
const PAGE_SEGMENTS = 30;
const SEGMENT_WIDTH = PAGE_WIDTH / PAGE_SEGMENTS;
const HALF_PAGE_WIDTH = PAGE_WIDTH / 2;
const whiteColor = "#ffffff";

pages.forEach((page) => {
  useTexture.preload(`/textures/${page.front}.jpg`);
  useTexture.preload(`/textures/${page.back}.jpg`);
  useTexture.preload(`/textures/book-cover-roughness.jpg`);
});

const Page = ({number, front, back, page, opened, bookClosed, ...props}) => {
    const [picture, picture2, pictureRoughness] = useTexture([
        `/textures/${front}.jpg`,
        `/textures/${back}.jpg`,
        ...(number === 0 || number === pages.length - 1
            ? ["/textures/book-cover-roughness.jpg"]
            : []),
    ]);
    picture.colorSpace = picture2.colorSpace = SRGBColorSpace;
    const group = useRef()
    const skinnedMeshRef = useRef()
    const turnedAt = useRef(0);
    const lastOpened = useRef(opened);

    const manualSkinnedMesh = useMemo(() => {
        // Create a NEW geometry for each page
        const pageGeometry = new BoxGeometry(PAGE_WIDTH, PAGE_HEGHT, PAGE_DEPTH, PAGE_SEGMENTS, 2);

        const position = pageGeometry.attributes.position;
        const vertex = new Vector3();
        const skinIndexes = [];
        const skinWeights = [];

        for (let i = 0; i < position.count; i++) {
            vertex.fromBufferAttribute(position, i);
            const x = vertex.x + HALF_PAGE_WIDTH;
            const skinIndex = Math.max(0, Math.floor(x / SEGMENT_WIDTH));
            let skinWeight = (x % SEGMENT_WIDTH) / SEGMENT_WIDTH;
            skinIndexes.push(skinIndex, skinIndex + 1, 0, 0);
            skinWeights.push(1 - skinWeight, skinWeight, 0, 0);
        }

        pageGeometry.setAttribute("skinIndex", new Uint16BufferAttribute(skinIndexes, 4));
        pageGeometry.setAttribute("skinWeight", new Float32BufferAttribute(skinWeights, 4));

        const bones = [];
        for(let i = 0; i < PAGE_SEGMENTS + 1; i++) {
            let bone = new Bone();
            bones.push(bone);
            if (i===0) {
                bone.position.x = -HALF_PAGE_WIDTH;
            } else {
                bone.position.x = SEGMENT_WIDTH;
            }
            if (i > 0) {
                bones[i-1].add(bone);
            }
        }
        const skeleton = new Skeleton(bones);
        
        // Create NEW materials for each page to avoid sharing
        const pageMaterials = [
            new MeshStandardMaterial({
                color: whiteColor,
            }),
            new MeshStandardMaterial({
                color: "#26a75aff",
            }),
            new MeshStandardMaterial({
                color: whiteColor,
            }),
            new MeshStandardMaterial({
                color: whiteColor,
            }),
        ];
        
        const materials = [...pageMaterials,
            new MeshStandardMaterial({
                color: whiteColor,
                map: picture,
                ...(number === 0
                    ? {
                        roughnessMap: pictureRoughness,
                        roughness: 0.1,
                    }
                    : {
                        roughness: 0.1,
                    }),
            }),
            new MeshStandardMaterial({
                color: whiteColor,
                map: picture2,
                ...(number === pages.length - 1
                       ? {
                        roughnessMap: pictureRoughness,
                        roughness: 0.1,
                    }
                    : {
                        roughness: 0.1,
                    }),
            }),
        ];
        const mesh = new SkinnedMesh(pageGeometry, materials);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.frustumCulled = false;
        mesh.add(skeleton.bones[0]);
        mesh.bind(skeleton);
        return mesh;
    }, [number, picture, picture2, pictureRoughness]); // Add dependencies


    useFrame((_, delta) => {
        if (!skinnedMeshRef.current || !group.current) return;

        if (lastOpened.current !== opened) {
            turnedAt.current = +new Date();
            lastOpened.current = opened;
        }
        let turningTime = Math.min(400, new Date() - turnedAt.current)/400;
        turningTime = Math.sin(turningTime * Math.PI);

        let targetRotation = opened ? -Math.PI/2 : Math.PI/2;
        if (!bookClosed) {
            targetRotation += degToRad(number*0.8);
        }

        const bones = skinnedMeshRef.current.skeleton.bones;
        for (let i = 0; i < bones.length; i++) {
            const target = i === 0 ? group.current : bones[i];
            const insideCurveIntensity = i < 8 ? Math.sin(i * 0.2 + 0.25) : 0;
            const outsideCurveIntensity = i >= 8 ? Math.cos(i * 0.3 + 0.09) : 0;
            const turningCurveIntensity = Math.sin(i * Math.PI * (1/bones.length))* turningTime;
            let rotationAngle = insideCurveStrength * insideCurveIntensity *targetRotation
            - outsideCurveStrength * outsideCurveIntensity * targetRotation +
            turningCurveStrength * turningCurveIntensity * targetRotation;
            let foldRotationAngle = degToRad(Math.sign(targetRotation) * 2);
            if (bookClosed) {
                if (i === 0) {
                    rotationAngle = targetRotation;
                    foldRotationAngle = 0;
                } else {
                    rotationAngle = 0;
                    foldRotationAngle = 0;
                }
            }
            easing.dampAngle(target.rotation, "y", rotationAngle, easingFactor, delta);

            const foldIntensity = i > 8 ? Math.sin(i * Math.PI * (1/bones.length) - 0.5) * turningTime : 0;
            easing.dampAngle(target.rotation, "x", foldRotationAngle * foldIntensity, easingFactorFold, delta);
        }
       
    })

    return (
        <group {...props} ref={group}>
            <primitive object={manualSkinnedMesh} ref={skinnedMeshRef} 
            position-z = {(-number * PAGE_DEPTH + page * PAGE_DEPTH) * 10}
            />
        </group>
    )
}

export const Book = ({...props}) => {
    const [page, setPage] = useAtom(pageAtom);
    return (
        <group {...props} rotation-y={-Math.PI/2}> 
        {[...pages].map((pageData, index) => (
            <Page
                key={index}
                page={page}
                number={index}
                opened={page > index}
                bookClosed= {page === 0 || page === pages.length}
                {...pageData}
            />
        ))}
    </group>
    )
}