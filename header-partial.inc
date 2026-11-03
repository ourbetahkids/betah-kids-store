<header class="site-header" id="siteHeader">

  <!-- MOBILE TOP ROW: hamburger + logo + icons (mobile only) -->
  <div class="header-top">
    <button class="hamburger-btn" id="hamburgerBtn" aria-label="Open menu" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>

    <a href="index.html" class="logo-mobile"><img src="images/logo.png" alt="Betah Kids Beauty World" class="logo-img-mobile"></a>

    <div class="header-icons">
      <a href="#" class="icon-link" aria-label="Account (coming soon)"><i class="fa-regular fa-user"></i></a>
      <a href="#" class="icon-link" aria-label="Wishlist (coming soon)"><i class="fa-regular fa-heart"></i></a>
      <a href="#" class="icon-link cart-icon-link" id="cartIconBtnMobile" aria-label="Cart">
        <i class="fa-solid fa-bag-shopping"></i>
        <span class="cart-badge">0</span>
      </a>
    </div>
  </div>

  <!-- DESKTOP: Logo (grid-area: logo) -->
  <a href="index.html" class="logo-desktop"><img src="images/logo.png" alt="Betah Kids Beauty World" class="logo-img-desktop"><span class="logo-tagline">&mdash; Beauty World &mdash;</span></a>

  <!-- SEARCH BAR ROW -->
  <div class="search-bar-row">
    <form class="search-form" id="searchForm">
      <input type="text" id="searchInput" class="search-input" placeholder="Search for products..." autocomplete="off">
      <button type="submit" class="search-btn" aria-label="Search"><i class="fa-solid fa-magnifying-glass"></i></button>
    </form>
    <div class="search-suggestions" id="searchSuggestions"></div>
  </div>

  <!-- DESKTOP: Account / Wishlist / Cart (grid-area: icons) -->
  <div class="nav-icons-desktop">
    <a href="#" class="icon-link" aria-label="Account (coming soon)">
      <span class="icon-visual"><i class="fa-regular fa-user"></i></span>
      <span class="icon-label-desktop">Account</span>
    </a>
    <a href="#" class="icon-link" aria-label="Wishlist (coming soon)">
      <span class="icon-visual"><i class="fa-regular fa-heart"></i></span>
      <span class="icon-label-desktop">Wishlist</span>
    </a>
    <a href="#" class="icon-link cart-icon-link" id="cartIconBtnDesktop" aria-label="Cart">
      <span class="icon-visual"><i class="fa-solid fa-bag-shopping"></i><span class="cart-badge">0</span></span>
      <span class="icon-label-desktop">Cart</span>
    </a>
  </div>

  <!-- DESKTOP: Nav links row 2 (grid-area: navrow) -->
  <div class="desktop-nav-row">
    <ul class="nav-links">
      <li><a href="index.html">Home</a></li>

      <li class="nav-dropdown">
        <a href="accessories.html">Accessories <i class="fa-solid fa-chevron-down nav-caret"></i></a>
        <ul class="nav-dropdown-menu">
          <li><a href="accessories.html?subcategory=Baby%20Accessories">Baby Accessories</a></li>
          <li><a href="accessories.html?subcategory=Boys%20Accessories">Boys Accessories</a></li>
          <li><a href="accessories.html?subcategory=Girls%20Accessories">Girls Accessories</a></li>
          <li><a href="accessories.html?subcategory=Socks">Socks</a></li>
          <li><a href="accessories.html?subcategory=Hats%20%26%20Sunglasses">Hats &amp; Sunglasses</a></li>
          <li><a href="accessories.html?subcategory=Headbands%20%26%20Hair%20Clips">Headbands &amp; Hair Clips</a></li>
          <li><a href="accessories.html?subcategory=Bibs%20%26%20Muslins">Bibs &amp; Muslins</a></li>
          <li><a href="accessories.html?subcategory=Rain%20Gear">Rain Gear</a></li>
          <li><a href="accessories.html?subcategory=Ballet%20Attire">Ballet Attire</a></li>
        </ul>
      </li>

      <li class="nav-dropdown">
        <a href="baby-essentials.html">Baby Essentials <i class="fa-solid fa-chevron-down nav-caret"></i></a>
        <ul class="nav-dropdown-menu">
          <li><a href="baby-essentials.html?subcategory=Diapering%20%26%20Bath">Diapering &amp; Bath</a></li>
          <li><a href="baby-essentials.html?subcategory=Feeding%20%26%20Nursing">Feeding &amp; Nursing</a></li>
          <li><a href="baby-essentials.html?subcategory=Bedding%20%26%20Furniture">Bedding &amp; Furniture</a></li>
          <li><a href="baby-essentials.html?subcategory=Travel%2C%20Health%20%26%20Safety">Travel, Health &amp; Safety</a></li>
        </ul>
      </li>

      <li class="nav-dropdown">
        <a href="clothing.html">Clothing <i class="fa-solid fa-chevron-down nav-caret"></i></a>
        <ul class="nav-dropdown-menu">
          <li><a href="clothing.html?subcategory=Baby%20Boy%20Clothing">Baby Boy Clothing</a></li>
          <li><a href="clothing.html?subcategory=Baby%20Girl%20Clothing">Baby Girl Clothing</a></li>
          <li><a href="clothing.html?subcategory=Boys%20Clothing">Boys Clothing</a></li>
          <li><a href="clothing.html?subcategory=Girls%20Clothing">Girls Clothing</a></li>
          <li><a href="clothing.html?subcategory=Boys%20Underwear">Boys Underwear</a></li>
          <li><a href="clothing.html?subcategory=Girls%20Underwear">Girls Underwear</a></li>
        </ul>
      </li>

      <li class="nav-dropdown">
        <a href="maternity.html">Maternity <i class="fa-solid fa-chevron-down nav-caret"></i></a>
        <ul class="nav-dropdown-menu">
          <li><a href="maternity.html?subcategory=Maternity%20Dresses">Maternity Dresses</a></li>
          <li><a href="maternity.html?subcategory=Maternity%20Trousers">Maternity Trousers</a></li>
          <li><a href="maternity.html?subcategory=Maternity%20Sleepwear">Maternity Sleepwear</a></li>
        </ul>
      </li>

      <li class="nav-dropdown">
        <a href="school.html">School <i class="fa-solid fa-chevron-down nav-caret"></i></a>
        <ul class="nav-dropdown-menu">
          <li><a href="school.html?subcategory=Uniforms">Uniforms</a></li>
          <li><a href="school.html?subcategory=Bags%20%26%20Backpacks">Bags &amp; Backpacks</a></li>
          <li><a href="school.html?subcategory=Lunch%20Boxes%20%26%20Bottles">Lunch Boxes &amp; Bottles</a></li>
          <li><a href="school.html?subcategory=Stationery%20%26%20Supplies">Stationery &amp; Supplies</a></li>
          <li><a href="school.html?subcategory=Books">Books</a></li>
          <li><a href="shoes.html?subcategory=School%20Shoes">School Shoes</a></li>
        </ul>
      </li>

      <li class="nav-dropdown">
        <a href="shoes.html">Shoes <i class="fa-solid fa-chevron-down nav-caret"></i></a>
        <ul class="nav-dropdown-menu">
          <li><a href="shoes.html?subcategory=Baby%20Shoes">Baby Shoes</a></li>
          <li><a href="shoes.html?subcategory=Boys%20Shoes">Boys Shoes</a></li>
          <li><a href="shoes.html?subcategory=Girls%20Shoes">Girls Shoes</a></li>
          <li><a href="shoes.html?subcategory=School%20Shoes">School Shoes</a></li>
        </ul>
      </li>

      <li class="nav-dropdown">
        <a href="toys.html">Toys <i class="fa-solid fa-chevron-down nav-caret"></i></a>
        <ul class="nav-dropdown-menu">
          <li><a href="toys.html?subcategory=Gifts%20Under%20%E2%82%A630k">Gifts Under &#8358;30k</a></li>
          <li><a href="toys.html?subcategory=Babies%20%26%20Preschoolers%20(0-2)">Babies &amp; Preschoolers (0-2)</a></li>
          <li><a href="toys.html?subcategory=Toddlers%20(2%2B)">Toddlers (2+)</a></li>
          <li><a href="toys.html?subcategory=Kids%20(4%2B)">Kids (4+)</a></li>
          <li><a href="toys.html?subcategory=Big%20Kids%20(7%2B)">Big Kids (7+)</a></li>
          <li><a href="toys.html?subcategory=Playmats%20%26%20Activity">Playmats &amp; Activity</a></li>
          <li><a href="toys.html?subcategory=Costumes%20%26%20Dress-Up">Costumes &amp; Dress-Up</a></li>
          <li><a href="toys.html?subcategory=Bicycles%2C%20Scooters%20%26%20Ride-Ons">Bicycles, Scooters &amp; Ride-Ons</a></li>
          <li><a href="toys.html?subcategory=Outdoor%20%26%20Garden%20Play">Outdoor &amp; Garden Play</a></li>
          <li><a href="toys.html?subcategory=Swimming%20%26%20Beach">Swimming &amp; Beach</a></li>
          <li><a href="toys.html?subcategory=Party%20%26%20Balloons">Party &amp; Balloons</a></li>
        </ul>
      </li>

    </ul>
  </div>

  <!-- MOBILE FULL-SCREEN ACCORDION MENU -->
  <div class="mobile-menu-overlay" id="mobileMenuOverlay">
    <ul class="mobile-menu-list">
      <li><a href="index.html" class="mobile-menu-link">Home</a></li>

      <li class="mobile-accordion">
        <button class="mobile-accordion-toggle" type="button" aria-expanded="false">Accessories <i class="fa-solid fa-chevron-down"></i></button>
        <div class="mobile-accordion-panel">
          <a href="accessories.html">All Accessories</a>
          <a href="accessories.html?subcategory=Baby%20Accessories">Baby Accessories</a>
          <a href="accessories.html?subcategory=Boys%20Accessories">Boys Accessories</a>
          <a href="accessories.html?subcategory=Girls%20Accessories">Girls Accessories</a>
          <a href="accessories.html?subcategory=Socks">Socks</a>
          <a href="accessories.html?subcategory=Hats%20%26%20Sunglasses">Hats &amp; Sunglasses</a>
          <a href="accessories.html?subcategory=Headbands%20%26%20Hair%20Clips">Headbands &amp; Hair Clips</a>
          <a href="accessories.html?subcategory=Bibs%20%26%20Muslins">Bibs &amp; Muslins</a>
          <a href="accessories.html?subcategory=Rain%20Gear">Rain Gear</a>
          <a href="accessories.html?subcategory=Ballet%20Attire">Ballet Attire</a>
        </div>
      </li>

      <li class="mobile-accordion">
        <button class="mobile-accordion-toggle" type="button" aria-expanded="false">Baby Essentials <i class="fa-solid fa-chevron-down"></i></button>
        <div class="mobile-accordion-panel">
          <a href="baby-essentials.html">All Baby Essentials</a>
          <a href="baby-essentials.html?subcategory=Diapering%20%26%20Bath">Diapering &amp; Bath</a>
          <a href="baby-essentials.html?subcategory=Feeding%20%26%20Nursing">Feeding &amp; Nursing</a>
          <a href="baby-essentials.html?subcategory=Bedding%20%26%20Furniture">Bedding &amp; Furniture</a>
          <a href="baby-essentials.html?subcategory=Travel%2C%20Health%20%26%20Safety">Travel, Health &amp; Safety</a>
        </div>
      </li>

      <li class="mobile-accordion">
        <button class="mobile-accordion-toggle" type="button" aria-expanded="false">Clothing <i class="fa-solid fa-chevron-down"></i></button>
        <div class="mobile-accordion-panel">
          <a href="clothing.html">All Clothing</a>
          <a href="clothing.html?subcategory=Baby%20Boy%20Clothing">Baby Boy Clothing</a>
          <a href="clothing.html?subcategory=Baby%20Girl%20Clothing">Baby Girl Clothing</a>
          <a href="clothing.html?subcategory=Boys%20Clothing">Boys Clothing</a>
          <a href="clothing.html?subcategory=Girls%20Clothing">Girls Clothing</a>
          <a href="clothing.html?subcategory=Boys%20Underwear">Boys Underwear</a>
          <a href="clothing.html?subcategory=Girls%20Underwear">Girls Underwear</a>
        </div>
      </li>

      <li class="mobile-accordion">
        <button class="mobile-accordion-toggle" type="button" aria-expanded="false">Maternity <i class="fa-solid fa-chevron-down"></i></button>
        <div class="mobile-accordion-panel">
          <a href="maternity.html">All Maternity</a>
          <a href="maternity.html?subcategory=Maternity%20Dresses">Maternity Dresses</a>
          <a href="maternity.html?subcategory=Maternity%20Trousers">Maternity Trousers</a>
          <a href="maternity.html?subcategory=Maternity%20Sleepwear">Maternity Sleepwear</a>
        </div>
      </li>

      <li class="mobile-accordion">
        <button class="mobile-accordion-toggle" type="button" aria-expanded="false">School <i class="fa-solid fa-chevron-down"></i></button>
        <div class="mobile-accordion-panel">
          <a href="school.html">All School</a>
          <a href="school.html?subcategory=Uniforms">Uniforms</a>
          <a href="school.html?subcategory=Bags%20%26%20Backpacks">Bags &amp; Backpacks</a>
          <a href="school.html?subcategory=Lunch%20Boxes%20%26%20Bottles">Lunch Boxes &amp; Bottles</a>
          <a href="school.html?subcategory=Stationery%20%26%20Supplies">Stationery &amp; Supplies</a>
          <a href="school.html?subcategory=Books">Books</a>
          <a href="shoes.html?subcategory=School%20Shoes">School Shoes</a>
        </div>
      </li>

      <li class="mobile-accordion">
        <button class="mobile-accordion-toggle" type="button" aria-expanded="false">Shoes <i class="fa-solid fa-chevron-down"></i></button>
        <div class="mobile-accordion-panel">
          <a href="shoes.html">All Shoes</a>
          <a href="shoes.html?subcategory=Baby%20Shoes">Baby Shoes</a>
          <a href="shoes.html?subcategory=Boys%20Shoes">Boys Shoes</a>
          <a href="shoes.html?subcategory=Girls%20Shoes">Girls Shoes</a>
          <a href="shoes.html?subcategory=School%20Shoes">School Shoes</a>
        </div>
      </li>

      <li class="mobile-accordion">
        <button class="mobile-accordion-toggle" type="button" aria-expanded="false">Toys <i class="fa-solid fa-chevron-down"></i></button>
        <div class="mobile-accordion-panel">
          <a href="toys.html">All Toys</a>
          <a href="toys.html?subcategory=Gifts%20Under%20%E2%82%A630k">Gifts Under &#8358;30k</a>
          <a href="toys.html?subcategory=Babies%20%26%20Preschoolers%20(0-2)">Babies &amp; Preschoolers (0-2)</a>
          <a href="toys.html?subcategory=Toddlers%20(2%2B)">Toddlers (2+)</a>
          <a href="toys.html?subcategory=Kids%20(4%2B)">Kids (4+)</a>
          <a href="toys.html?subcategory=Big%20Kids%20(7%2B)">Big Kids (7+)</a>
          <a href="toys.html?subcategory=Playmats%20%26%20Activity">Playmats &amp; Activity</a>
          <a href="toys.html?subcategory=Costumes%20%26%20Dress-Up">Costumes &amp; Dress-Up</a>
          <a href="toys.html?subcategory=Bicycles%2C%20Scooters%20%26%20Ride-Ons">Bicycles, Scooters &amp; Ride-Ons</a>
          <a href="toys.html?subcategory=Outdoor%20%26%20Garden%20Play">Outdoor &amp; Garden Play</a>
          <a href="toys.html?subcategory=Swimming%20%26%20Beach">Swimming &amp; Beach</a>
          <a href="toys.html?subcategory=Party%20%26%20Balloons">Party &amp; Balloons</a>
        </div>
      </li>

    </ul>
  </div>

</header>
