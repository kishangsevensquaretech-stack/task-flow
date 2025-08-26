import React, { useCallback, useMemo } from "react";
import { Moon, Sun, Monitor, Palette, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTheme } from "./ThemeProvider";

export const ThemeSelector = React.memo(() => {
  const { theme, setTheme, colorTheme, setColorTheme, colorThemes } =
    useTheme();

  const getThemeIcon = useCallback(() => {
    switch (theme) {
      case "light":
        return <Sun className="h-4 w-4" />;
      case "dark":
        return <Moon className="h-4 w-4" />;
      case "system":
        return <Monitor className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  }, [theme]);

  const handleThemeChange = useCallback(
    (newTheme: "light" | "dark" | "system") => {
      setTheme(newTheme);
    },
    [setTheme],
  );

  const handleColorChange = useCallback(
    (color: any) => {
      setColorTheme(color);
    },
    [setColorTheme],
  );

  const colorButtons = useMemo(
    () =>
      colorThemes.map((color) => (
        <Button
          key={color.name}
          variant="outline"
          size="sm"
          onClick={() => handleColorChange(color)}
          className="justify-start"
        >
          <div
            className="h-4 w-4 rounded-full mr-2"
            style={{ backgroundColor: color.primary }}
          />
          {color.name}
          {colorTheme.name === color.name && (
            <Check className="h-4 w-4 ml-auto" />
          )}
        </Button>
      )),
    [colorThemes, colorTheme.name, handleColorChange],
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Palette className="h-4 w-4 mr-2" />
          Theme
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium leading-none mb-3">Appearance</h4>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                size="sm"
                onClick={() => handleThemeChange("light")}
                className="justify-start"
              >
                <Sun className="h-4 w-4 mr-2" />
                Light
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                size="sm"
                onClick={() => handleThemeChange("dark")}
                className="justify-start"
              >
                <Moon className="h-4 w-4 mr-2" />
                Dark
              </Button>
              <Button
                variant={theme === "system" ? "default" : "outline"}
                size="sm"
                onClick={() => handleThemeChange("system")}
                className="justify-start"
              >
                <Monitor className="h-4 w-4 mr-2" />
                System
              </Button>
            </div>
          </div>

          <div>
            <h4 className="font-medium leading-none mb-3">Color Theme</h4>
            <div className="grid grid-cols-2 gap-2">{colorButtons}</div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
});

ThemeSelector.displayName = "ThemeSelector";
