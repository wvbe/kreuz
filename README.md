# Kreuzzeug im Nagelhosen

This is a toy project that I've used as a learning platform over the years, meant for my entertainment
and hopefully yours one day.

The current latest iteration

- [Online demo](https://wvbe.github.io/kreuzzeug-im-nagelhosen/)
- [Board](https://github.com/users/wvbe/projects/4/)
- [Milestones](https://github.com/wvbe/kreuzzeug-im-nagelhosen/milestones)

### Setup

This is a [Deno](https://deno.land) project. The `library/` folder is everything you need to run
this game pretty much "headless", eg. without UI. A front-end like CLI (`/application/cli`), HTML
(`application/debug/`) or ThreeJS will make the game a lot more fun, and a `Driver` specialization
can bind a lot of the events that you need for that.

### Scripts

```ts
deno task test
```

### Glossary of terms

- **Generator** creates a game from scratch, semi-randomly.
- **Game** is the central game API that connects entities, terrain and so on to one another.
  - **TimeLine** is the in-game concept of time. It can progress at any rate that you like, pause
    etc. The timeline is an instance of an `EventedValue`
    - **EventedValue** is a value that
      sometimes updates, and emits an event when it does. Ther
      are other types of evented values too.
  - **Entities** are things that interact and can be interacted with, such as "people" or "buildings".
  - ~~**Jobs** are activities that some entities engage in. For example, a person might patrol an
    area or just loiter around.~~ Being superseded by _Tasks_.
  - **Tasks** are activities that some entities are assigned to. Tasks can have subtasks, and may interrupt subtasks in favor of another one.
  - **Materials** is a type of substance that could be used in quantities during a blueprint, or if
    you have a quantity of `Material` it can be consumed. A `number` of `Material` is usually called
    a `MaterialState`.
  - **Blueprints** are the immutable instructions to create a quantity of `Material` out of other
    `Material`s.
- **Drivers** attach the game to a rendering engine, like ThreeJS, a HTML page, Canvas, or your
  terminal. In many cases the driver has some control over how time progresses (eg. by using
  `requestAnimationFrame` or waiting for user input).

### Helpful articles that I may or may not have already used

- https://observablehq.com/@scarysize/finding-random-points-in-a-polygon

### License

Although this code is open-sourced, it is not open-licensed. I probably would license it to you
if you [submit an issue for it](https://github.com/wvbe/kreuzzeug-im-nagelhosen/issues/new),
and probably won't if you don't.
