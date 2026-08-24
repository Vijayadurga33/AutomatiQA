### Summary of Changes
1. **Framework Conversion (Playwright TS to Selenium Java)**: Transformed the existing Instagram login testing suite into a standard Java + Selenium WebDriver framework using TestNG and Maven structure.
2. **`utils/EnvUtils.java`**: Added environment variable management utility class with fallback values for Instagram URL (`https://www.instagram.com`), username (`vijaya`), and password (`vijju789`).
3. **`pages/BasePage.java`**: Implemented a public base page using Selenium WebDriver with explicit waits (`WebDriverWait`).
4. **`pages/LoginPage.java`**: Built the Instagram Login page object with public Selenium `By` locators and user action methods.
5. **`tests/BaseTest.java`**: Configured cross-browser initialization and cleanup logic using `WebDriverManager` and TestNG annotations (`@BeforeMethod`, `@AfterMethod`).
6. **`tests/LoginTest.java`**: Created test case verifying credential entry using TestNG assertions.

---

### Impacted Files
- `src/main/java/utils/EnvUtils.java`
- `src/main/java/pages/BasePage.java`
- `src/main/java/pages/LoginPage.java`
- `src/test/java/tests/BaseTest.java`
- `src/test/java/tests/LoginTest.java`

---

### 📂 Full Source Code

#### `src/main/java/utils/EnvUtils.java`
```java
package utils;

/**
 * Utility class for managing environment variables with defaults.
 */
public class EnvUtils {
    public static final String BASE_URL = System.getenv("BASE_URL") != null ? System.getenv("BASE_URL") : "https://www.instagram.com";
    public static final String USERNAME = System.getenv("USERNAME") != null ? System.getenv("USERNAME") : "vijaya";
    public static final String PASSWORD = System.getenv("PASSWORD") != null ? System.getenv("PASSWORD") : "vijju789";
}
```

#### `src/main/java/pages/BasePage.java`
```java
package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

/**
 * Reusable Base Page containing core Selenium interaction primitives.
 */
public class BasePage {
    public WebDriver driver;
    public WebDriverWait wait;

    public BasePage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(15));
    }

    public WebElement waitForVisibility(By locator) {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(locator));
    }

    public void fill(By locator, String value) {
        WebElement element = waitForVisibility(locator);
        element.clear();
        element.sendKeys(value);
    }

    public void click(By locator) {
        wait.until(ExpectedConditions.elementToBeClickable(locator)).click();
    }

    public String getInputValue(By locator) {
        return waitForVisibility(locator).getAttribute("value");
    }
}
```

#### `src/main/java/pages/LoginPage.java`
```java
package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

/**
 * Page Object Model representation of the Instagram Login page.
 */
public class LoginPage extends BasePage {

    public By usernameInput = By.name("username");
    public By passwordInput = By.name("password");
    public By loginButton = By.cssSelector("button[type='submit']");

    public LoginPage(WebDriver driver) {
        super(driver);
    }

    public void enterUsername(String username) {
        fill(usernameInput, username);
    }

    public void enterPassword(String password) {
        fill(passwordInput, password);
    }

    public void clickLogin() {
        click(loginButton);
    }

    public String getEnteredUsername() {
        return getInputValue(usernameInput);
    }

    public String getEnteredPassword() {
        return getInputValue(passwordInput);
    }
}
```

#### `src/test/java/tests/BaseTest.java`
```java
package tests;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import utils.EnvUtils;

import java.time.Duration;

/**
 * Base test setup for browser configuration and lifecycle management.
 */
public class BaseTest {
    public WebDriver driver;

    @BeforeMethod
    public void setUp() {
        WebDriverManager.chromedriver().setup();
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--start-maximized");
        options.addArguments("--disable-notifications");

        driver = new ChromeDriver(options);
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));
        driver.get(EnvUtils.BASE_URL);
    }

    @AfterMethod
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }
}
```

#### `src/test/java/tests/LoginTest.java`
```java
package tests;

import org.testng.Assert;
import org.testng.annotations.Test;
import pages.LoginPage;
import utils.EnvUtils;

/**
 * Test class for verifying credential inputs on Instagram login.
 */
public class LoginTest extends BaseTest {

    @Test(description = "Enter username and password on Instagram login page")
    public void testEnterCredentialsOnInstagram() {
        LoginPage loginPage = new LoginPage(driver);

        // Step 1: Enter username ('vijaya')
        loginPage.enterUsername(EnvUtils.USERNAME);

        // Step 2: Enter password ('vijju789')
        loginPage.enterPassword(EnvUtils.PASSWORD);

        // Verify input fields hold expected credential values
        Assert.assertEquals(loginPage.getEnteredUsername(), EnvUtils.USERNAME, "Username field value mismatch!");
        Assert.assertEquals(loginPage.getEnteredPassword(), EnvUtils.PASSWORD, "Password field value mismatch!");
    }
}
```