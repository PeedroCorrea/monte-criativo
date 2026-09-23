// Pure timeline data: all states derive from scroll position, never elapsed time.
export const chapters = ['trabalhos', 'visao', 'atencao', 'estrategia', 'originalidade', 'portfolio'];
export const chapterStops = [0, .27, .44, .61, .78, 1];
export const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const mix = (a, b, t) => a + (b - a) * t;
const ease = t => t * t * (3 - 2 * t);
const card = (x, y, scale, rotate, opacity = 1) => ({ x, y, scale, rotate, opacity });

function poses(mobile) {
  const focal = mobile ? card(.5, .335, 1, 0) : card(.75, .51, 1, 0);
  return [
    mobile
      ? [card(.47, .355, .7, -5), card(.08, .33, .94, -10), card(.85, .29, .53, 7)]
      : [card(.46, .37, .58, -5), card(.09, .34, .94, -10), card(.68, .29, .43, 7)],
    mobile
      ? [card(.10, .67, .8, -15), card(.49, .5, .88, -8), card(.88, .32, .76, 1)]
      : [card(.27, .66, .72, -15), card(.51, .47, .83, -8), card(.75, .28, .73, 1)],
    [focal, card(.3, -.6, .6, -24, 0), card(1.3, .35, .6, 18, 0)],
    [card(.9, 1.35, .7, 14, 0), focal, card(1.2, -.3, .6, 13, 0)],
    [card(-.3, 1.2, .6, -10, 0), card(.4, -.6, .6, -16, 0), focal],
    [card(.2, -.5, .3, -6, 0), card(.5, -.5, .3, 0, 0), card(.8, -.5, .3, 6, 0)],
  ];
}

const keys = [
  { at: 0, scene: 0 }, { at: .13, scene: 0 },
  { at: .23, scene: 1 }, { at: .31, scene: 1 },
  { at: .40, scene: 2 }, { at: .48, scene: 2 },
  { at: .57, scene: 3 }, { at: .65, scene: 3 },
  { at: .74, scene: 4 }, { at: .82, scene: 4 },
  { at: .93, scene: 5 }, { at: 1, scene: 5 },
];

export function sampleStory(rawProgress, mobile = false) {
  const progress = clamp(Number.isFinite(rawProgress) ? rawProgress : 0);
  let index = keys.findIndex((key, i) => i < keys.length - 1 && progress <= keys[i + 1].at);
  if (index < 0) index = keys.length - 2;
  const start = keys[index];
  const end = keys[index + 1];
  const t = clamp((progress - start.at) / (end.at - start.at));
  const changing = start.scene !== end.scene;
  const scene = changing && t >= .5 ? end.scene : start.scene;
  const layers = chapters.map(() => ({ opacity: 0, y: 0 }));
  if (changing) {
    layers[start.scene] = { opacity: 1 - ease(clamp(t / .46)), y: -70 * ease(t) };
    layers[end.scene] = { opacity: ease(clamp((t - .54) / .46)), y: 70 * (1 - ease(t)) };
  } else layers[scene] = { opacity: 1, y: 0 };

  const positions = poses(mobile);
  const cards = positions[start.scene].map((from, i) => {
    const to = positions[end.scene][i];
    return Object.fromEntries(Object.keys(from).map(key => [key, mix(from[key], to[key], ease(t))]));
  });
  if (progress <= .13) {
    cards.forEach((pose, i) => {
      const entrance = ease(clamp((progress - i * .018) / .085));
      pose.y = mix(1.35 + i * .1, pose.y, entrance);
      pose.rotate += 12 * (1 - entrance);
      pose.scale *= mix(.84, 1, entrance);
      pose.opacity *= entrance;
    });
  }
  return { progress, scene, layers, cards };
}
