# Kreuzzeug im Nagelhosen

A pet project game, or at least a few parts of it. Big thanks go out the internet for making this
possible!


-   [Demo](https://wvbe.github.io/kreuzzeug-im-nagelhosen/)
-   [Milestones](https://github.com/wvbe/kreuzzeug-im-nagelhosen/milestones)
-   [Kanban board](https://github.com/users/wvbe/projects/4/)

---

**About the name**, it's a bastardization of German and the title of
[a book that intrigued me as a child](https://en.wikipedia.org/wiki/Crusade_in_Jeans).

---

## Glossary of terms

- **Generator** creates a game from scratch, semi-randomly.
- **Game** is the central game API that connects entities, terrain and so on to one another.
	- **TimeLine** is the in-game concept of time. It can progress at any rate that you like, pause etc. The timeline is an instance of an `EventedValue`
		- **EventedValue** is a value that sometimes updates, and emits an event when it does. There are other types of evented values too.
	- **Entities** are things that interact and can be interacted with, such as "people" or "places".
	- **Jobs** are activities that some entities engage in. For example, a person might patrol an area or just loiter around.
- **Drivers** attach the game to a rendering engine, like ThreeJS, a HTML page, Canvas, or your
terminal. In many cases the driver has some control over how time progresses (eg. by using
`requestAnimationFrame` or waiting for user input).


## License

Although this code is open-sourced, it is not open-licensed. I probably would license it to you
if you [submit an issue for it](https://github.com/wvbe/kreuzzeug-im-nagelhosen/issues/new),
and probably won't if you don't.
