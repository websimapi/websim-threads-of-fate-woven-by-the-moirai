import { Fragment, jsxDEV } from "react/jsx-dev-runtime";
import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { WebsimSocket, useQuery } from "@websim/use-query";
import * as THREE from "three";
import { createNoise2D } from "simplex-noise";
const room = new WebsimSocket();
const FATE_TYPES = [
  "Clotho's Thread",
  // Spinner of life
  "Lachesis's Measure",
  // Allotter of fate
  "Atropos's Cut"
  // The inevitable end
];
const FATE_ASPECTS = [
  "Creation",
  "Wisdom",
  "Love",
  "Adventure",
  "Discovery",
  "Innovation",
  "Connection",
  "Growth",
  "Transformation",
  "Legacy",
  "Harmony",
  "Courage"
];
function generateFateThread(user) {
  const createdAt = new Date(user.created_at);
  const now = /* @__PURE__ */ new Date();
  const accountAge = (now - createdAt) / (1e3 * 60 * 60 * 24);
  let fateType;
  if (accountAge < 30) {
    fateType = FATE_TYPES[0];
  } else if (accountAge < 365) {
    fateType = FATE_TYPES[1];
  } else {
    fateType = FATE_TYPES[2];
  }
  const nameHash = user.username.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const primaryAspect = FATE_ASPECTS[nameHash % FATE_ASPECTS.length];
  const secondaryAspect = FATE_ASPECTS[nameHash * 3 % FATE_ASPECTS.length];
  const descriptions = {
    [FATE_TYPES[0]]: [
      `The golden thread of ${user.username} begins to shimmer, woven with the essence of ${primaryAspect.toLowerCase()}. Clotho's fingers dance as new possibilities unfold.`,
      `In the cosmic loom, ${user.username}'s thread gleams with potential, touched by the spirit of ${primaryAspect.toLowerCase()}. The Fates smile upon this new beginning.`,
      `Fresh silk spins for ${user.username}, imbued with ${primaryAspect.toLowerCase()}'s power. The thread catches starlight as it takes its place in destiny's tapestry.`
    ],
    [FATE_TYPES[1]]: [
      `Lachesis measures ${user.username}'s thread with careful precision, finding the perfect balance between ${primaryAspect.toLowerCase()} and ${secondaryAspect.toLowerCase()}. The pattern grows complex and beautiful.`,
      `The thread of ${user.username} has found its rhythm in the grand design, weaving through realms of ${primaryAspect.toLowerCase()} with threads of ${secondaryAspect.toLowerCase()} intertwined.`,
      `${user.username}'s fate-line pulses with established power, carrying the dual essence of ${primaryAspect.toLowerCase()} and ${secondaryAspect.toLowerCase()} through destiny's halls.`
    ],
    [FATE_TYPES[2]]: [
      `Ancient and wise, ${user.username}'s thread has weathered many seasons. Atropos observes its strength, noting how ${primaryAspect.toLowerCase()} has shaped its journey through time's passage.`,
      `The weathered thread of ${user.username} tells tales of ${primaryAspect.toLowerCase()} and wisdom earned. Even Atropos pauses before such a storied strand.`,
      `In the deepest part of the tapestry lies ${user.username}'s thread, rich with the patina of ${primaryAspect.toLowerCase()} and countless untold stories.`
    ]
  };
  const description = descriptions[fateType][nameHash % 3];
  return {
    user_id: user.id,
    username: user.username,
    fate_type: fateType,
    primary_aspect: primaryAspect,
    secondary_aspect: secondaryAspect,
    description,
    thread_strength: Math.min(accountAge / 365 * 100, 100),
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    thread_color: `hsl(${nameHash * 137 % 360}, 70%, 65%)`
  };
}
function ThreadVisualization({ threads }) {
  const containerRef = useRef();
  const sceneRef = useRef();
  const rendererRef = useRef();
  useEffect(() => {
    if (!threads.length || !containerRef.current) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1e3);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0, 0);
    containerRef.current.appendChild(renderer.domElement);
    sceneRef.current = scene;
    rendererRef.current = renderer;
    const noise = createNoise2D();
    threads.forEach((thread, index) => {
      const points = [];
      const threadCount = 50;
      for (let i = 0; i < threadCount; i++) {
        const t = i / threadCount;
        const angle = t * Math.PI * 4 + index * 0.5;
        const radius = 2 + noise(t * 5, index * 0.1) * 0.5;
        points.push(new THREE.Vector3(
          Math.cos(angle) * radius,
          (t - 0.5) * 8 + noise(t * 3, index * 0.2) * 2,
          Math.sin(angle) * radius + index * 0.5
        ));
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const color = new THREE.Color(thread.thread_color);
      const material = new THREE.LineBasicMaterial({
        color,
        linewidth: 2,
        transparent: true,
        opacity: 0.8
      });
      const line = new THREE.Line(geometry, material);
      line.position.x = index % 5 * 2 - 4;
      line.position.z = Math.floor(index / 5) * 2 - 2;
      scene.add(line);
    });
    const ambientLight = new THREE.AmbientLight(13938487, 0.4);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(16766720, 0.8, 100);
    pointLight.position.set(0, 5, 5);
    scene.add(pointLight);
    camera.position.set(0, 3, 8);
    camera.lookAt(0, 0, 0);
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      scene.rotation.y += 5e-3;
      renderer.render(scene, camera);
    };
    animate();
    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [threads]);
  return /* @__PURE__ */ jsxDEV("div", { ref: containerRef }, void 0, false, {
    fileName: "<stdin>",
    lineNumber: 160,
    columnNumber: 12
  }, this);
}
function ThreadCard({ thread }) {
  return /* @__PURE__ */ jsxDEV("div", { className: "thread-card", children: [
    /* @__PURE__ */ jsxDEV("div", { className: "thread-header", children: [
      /* @__PURE__ */ jsxDEV(
        "img",
        {
          src: `https://images.websim.com/avatar/${thread.username}`,
          alt: thread.username,
          className: "user-avatar"
        },
        void 0,
        false,
        {
          fileName: "<stdin>",
          lineNumber: 167,
          columnNumber: 17
        },
        this
      ),
      /* @__PURE__ */ jsxDEV("div", { className: "user-info", children: [
        /* @__PURE__ */ jsxDEV("h3", { children: [
          "@",
          thread.username
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 173,
          columnNumber: 21
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "fate-type", children: thread.fate_type }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 174,
          columnNumber: 21
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 172,
        columnNumber: 17
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 166,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "thread-content", children: [
      /* @__PURE__ */ jsxDEV("p", { className: "fate-description", children: thread.description }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 178,
        columnNumber: 17
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "thread-stats", children: [
        /* @__PURE__ */ jsxDEV("span", { children: [
          "Aspect: ",
          thread.primary_aspect
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 180,
          columnNumber: 21
        }, this),
        /* @__PURE__ */ jsxDEV("span", { children: [
          "Strength: ",
          Math.round(thread.thread_strength),
          "%"
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 181,
          columnNumber: 21
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 179,
        columnNumber: 17
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 177,
      columnNumber: 13
    }, this)
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 165,
    columnNumber: 9
  }, this);
}
function App() {
  const [isWeaving, setIsWeaving] = useState(false);
  const [error, setError] = useState(null);
  const { data: threads, loading } = useQuery(room.collection("fate_thread"));
  const { data: users } = useQuery(room.query("SELECT id, username, created_at FROM public.user LIMIT 50"));
  const weaveNewThreads = async () => {
    if (!users || users.length === 0) {
      setError("No users found to weave threads for");
      return;
    }
    setIsWeaving(true);
    setError(null);
    try {
      const existingUserIds = new Set(threads?.map((t) => t.user_id) || []);
      const usersNeedingThreads = users.filter((user) => !existingUserIds.has(user.id));
      for (const user of usersNeedingThreads.slice(0, 10)) {
        const fateThread = generateFateThread(user);
        await room.collection("fate_thread").create(fateThread);
      }
    } catch (err) {
      setError("Failed to weave new threads: " + err.message);
    } finally {
      setIsWeaving(false);
    }
  };
  const reweaveAllThreads = async () => {
    if (!users || users.length === 0) return;
    setIsWeaving(true);
    setError(null);
    try {
      for (const user of users.slice(0, 20)) {
        const fateThread = generateFateThread(user);
        await room.collection("fate_thread").upsert({
          id: `thread_${user.id}`,
          ...fateThread
        });
      }
    } catch (err) {
      setError("Failed to reweave threads: " + err.message);
    } finally {
      setIsWeaving(false);
    }
  };
  return /* @__PURE__ */ jsxDEV("div", { children: [
    /* @__PURE__ */ jsxDEV("header", { className: "header", children: [
      /* @__PURE__ */ jsxDEV("h1", { className: "title", children: "Threads of Fate" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 244,
        columnNumber: 17
      }, this),
      /* @__PURE__ */ jsxDEV("p", { className: "subtitle", children: "Woven by the Moirai from the essence of souls" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 245,
        columnNumber: 17
      }, this),
      /* @__PURE__ */ jsxDEV("p", { className: "description", children: "Behold the cosmic tapestry where each user's destiny is spun into golden threads by the three Fates: Clotho who spins, Lachesis who measures, and Atropos who cuts. Each thread tells a unique story, woven from the very metadata of existence." }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 246,
        columnNumber: 17
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 243,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "controls", children: [
      /* @__PURE__ */ jsxDEV(
        "button",
        {
          className: "btn primary",
          onClick: weaveNewThreads,
          disabled: isWeaving,
          children: isWeaving ? "Weaving..." : "Weave New Threads"
        },
        void 0,
        false,
        {
          fileName: "<stdin>",
          lineNumber: 254,
          columnNumber: 17
        },
        this
      ),
      /* @__PURE__ */ jsxDEV(
        "button",
        {
          className: "btn",
          onClick: reweaveAllThreads,
          disabled: isWeaving,
          children: isWeaving ? "Reweaving..." : "Reweave All Threads"
        },
        void 0,
        false,
        {
          fileName: "<stdin>",
          lineNumber: 261,
          columnNumber: 17
        },
        this
      )
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 253,
      columnNumber: 13
    }, this),
    error && /* @__PURE__ */ jsxDEV("div", { className: "error", children: error }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 270,
      columnNumber: 23
    }, this),
    loading ? /* @__PURE__ */ jsxDEV("div", { className: "loading", children: "The Fates are consulting their tapestry..." }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 273,
      columnNumber: 17
    }, this) : /* @__PURE__ */ jsxDEV(Fragment, { children: [
      /* @__PURE__ */ jsxDEV(ThreadVisualization, { threads: threads || [] }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 276,
        columnNumber: 21
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "threads-container", children: (threads || []).map((thread) => /* @__PURE__ */ jsxDEV(ThreadCard, { thread }, thread.id, false, {
        fileName: "<stdin>",
        lineNumber: 280,
        columnNumber: 29
      }, this)) }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 278,
        columnNumber: 21
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 275,
      columnNumber: 17
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "moirai-info", children: [
      /* @__PURE__ */ jsxDEV("h2", { className: "moirai-title", children: "The Three Moirai" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 287,
        columnNumber: 17
      }, this),
      /* @__PURE__ */ jsxDEV("p", { className: "moirai-description", children: [
        "In ancient mythology, the Moirai were the three sister goddesses who controlled fate and destiny.",
        /* @__PURE__ */ jsxDEV("strong", { children: " Clotho" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 290,
          columnNumber: 21
        }, this),
        " spun the thread of life, ",
        /* @__PURE__ */ jsxDEV("strong", { children: "Lachesis" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 290,
          columnNumber: 71
        }, this),
        " measured its length and determined its course, and ",
        /* @__PURE__ */ jsxDEV("strong", { children: "Atropos" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 291,
          columnNumber: 52
        }, this),
        " cut it when the time came. Here, they work their magic on the digital souls of Websim, weaving threads from user creation dates, activity patterns, and the mystical essence of usernames themselves."
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 288,
        columnNumber: 17
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 286,
      columnNumber: 13
    }, this)
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 242,
    columnNumber: 9
  }, this);
}
const root = createRoot(document.getElementById("root"));
root.render(/* @__PURE__ */ jsxDEV(App, {}, void 0, false, {
  fileName: "<stdin>",
  lineNumber: 301,
  columnNumber: 13
}));
