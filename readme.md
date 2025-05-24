*Semestrální práce, B0B39KAJ*
# ERD Canvas

**ERD Canvas** je single-page aplikace pro rychlé a intuitivní vytváření Entity-Relationship Diagramů (ERD) přímo v prohlížeči.


## Hlavní funkce

- **Hash-based SPA routing**  
  Navigace mezi domovskou stránkou a editorem diagramů bez plného reloadu stránky pomocí hash routeru.

- **Editor DBML**  
  Textové pole s číslováním řádků, kde uživatel píše DBML popis databáze.  
  – Zpožděné parsování (debounce 400 ms)  
  – Vyznačení řádků se syntaktickou chybou a jejich celkový počet

- **Online/offline stav**  
  Indikátor „Online/Offline“ v patičce editoru pomocí `navigator.onLine` a  eventů.

- **Live rendering ERD**   
  Renderování v reálném čase.

- **Manipulace s diagramem**  
  Uživatel může plátno libovolně zoomovat či přesouvat entity pouhým tažením myši.

- **Ukládání stavu**  
  Po každé úspěšné změně se uloží stav do `localStorage`, a to včetně užovatelského inputu, tak odpovídající JSON struktuře.

- **Offline podpora**  
  Pomocí `ServiceWorker` se aplikace cachuje. Uživatel tak může po prvotní návštěvě používat aplikaci i offline.


## Jak to funuguje
Jako uživateslký vstup, se očekává řetězec ve formátu DBML ([Database Markup Language](https://dbml.dbdiagram.io/home)). Aplikace se ho následně pokusí převést do objektového formátu, pokud to proběhne úšpěšně

#### Například:
Následující DBML řetězec:
```
Table users {
  id integer
  username varchar
  role varchar
  created_at timestamp
}

Table posts {
  id integer [primary key]
  title varchar
  body text [note: 'Content of the post']
  user_id integer
  created_at timestamp
}

Ref: posts.user_id > users.id // many-to-one
```

Odpovídá následujícímu diagramu:

![Příklad diagramu](example.png)