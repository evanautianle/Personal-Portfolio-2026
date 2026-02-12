import {
    Bone,
    BoxGeometry,
    Float32BufferAttribute,
    MeshStandardMaterial,
    Skeleton,
    SkeletonHelper,
    SkinnedMesh,
    Uint16BufferAttribute,
    Vector3,
} from "three"
import {pages} from "./UI"
import { useMemo, useRef } from "react"
import { Box, useHelper } from "@react-three/drei";

const PAGE_WIDTH = 1.28;
const PAGE_HEGHT = 1.71;
const PAGE_DEPTH = 0.4;
const PAGE_SEGMENTS = 30;
const SEGMENT_WIDTH = PAGE_WIDTH / PAGE_SEGMENTS;
const HALF_PAGE_WIDTH = PAGE_WIDTH / 2;
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

const pageMaterials = [
    new MeshStandardMaterial({
        color: "white",
    }),
    new MeshStandardMaterial({
        color: "white",
    }),
    new MeshStandardMaterial({
        color: "red",
    }),
    new MeshStandardMaterial({
        color: "white",
    }),
    new MeshStandardMaterial({
        color: "white",
    }),
    new MeshStandardMaterial({
        color: "white",
    }),
]

const Page = ({number, front, back, ...props}) => {
    const group = useRef()
    const skinnedMeshRef = useRef()

    const manualSkinnedMesh = useMemo(() => {
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
        const materials = pageMaterials;
        const mesh = new SkinnedMesh(pageGeometry, materials);
        mesh.castShadow = true;
        mesh.recieveShadow = true;
        mesh.frustumCulled = false;
        mesh.add(skeleton.bones[0]);
        mesh.bind(skeleton);
        return mesh;
    }, []);

    useHelper(skinnedMeshRef, SkeletonHelper, "cyan");

    return (
        <group {...props}>
            <primitive object={manualSkinnedMesh} ref={skinnedMeshRef} />
        </group>
    )
}

export const Book = ({...props}) => {
    return (
        <group {...props}> 
        {[...pages].map((pageData, index) => 
            index === 0 ? (
                <Page
                    position-x={index * 0.15}
                    key={index}
                    number={index}
                    {...pageData}
                />
            ) : null
        )}
    </group>
    )
}