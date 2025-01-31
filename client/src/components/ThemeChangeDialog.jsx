import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useColorMode } from "@/hooks/useColorMode.js";

const ThemeChangeDialog = ({ children }) => {
  const [colorMode, setColorMode] = useColorMode();
  return (
    <Dialog>
      <DialogTrigger className="w-full">{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xl">Choose Theme</DialogTitle>
        </DialogHeader>
        <DialogDescription asChild>
          <RadioGroup
            defaultValue={colorMode === "light" ? "option-one" : "option-two"}
            className="flex flex-col space-y-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="option-one"
                id="option-one"
                onClick={() => setColorMode("light")}
              />
              <Label
                htmlFor="option-one"
                className="text-lg cursor-pointer"
                onClick={() => setColorMode("light")}
              >
                Light
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="option-two"
                id="option-two"
                onClick={() => setColorMode("dark")}
              />
              <Label
                htmlFor="option-two"
                className="text-lg cursor-pointer"
                onClick={() => setColorMode("dark")}
              >
                Dark
              </Label>
            </div>
          </RadioGroup>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};
export default ThemeChangeDialog;
