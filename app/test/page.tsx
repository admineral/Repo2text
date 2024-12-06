"use client";

import React, { useState } from "react";
import { Plus, Trash2, ArrowRight, ArrowLeft, Barcode, UserPlus, Users, Moon, Sun } from "lucide-react";

// Mocked UI components similar to shadcn/ui
function Button({ children, className = "", variant = "default", size = "default", disabled = false, ...props }: any) {
  const base = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";
  const variants: Record<string, string> = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900",
    ghost: "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800",
    destructive: "bg-red-600 text-white hover:bg-red-700",
  };
  const sizes: Record<string, string> = {
    default: "h-10 px-4 py-2",
    sm: "h-8 px-2",
    icon: "h-10 w-10",
  };
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`;
  return <button className={classes} disabled={disabled} {...props}>{children}</button>;
}

function Input({ className = "", ...props }: any) {
  return <input className={`block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 ${className}`} {...props} />;
}

function Label({ children, className = "", ...props }: any) {
  return <label className={`text-sm font-medium text-gray-700 dark:text-gray-200 ${className}`} {...props}>{children}</label>;
}

function RadioGroup({ children, value, onChange }: any) {
  return <div onChange={onChange} className="space-y-2">{children}</div>;
}

function RadioGroupItem({ value, id, ...props }: any) {
  return <input type="radio" value={value} id={id} name="radio-group" className="mr-2" {...props}/>;
}

function Card({ children, className = "", ...props }: any) {
  return <div className={`rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm ${className}`} {...props}>{children}</div>;
}

function CardHeader({ children, className = "", ...props }: any) {
  return <div className={`border-b border-gray-200 dark:border-gray-700 p-4 ${className}`} {...props}>{children}</div>;
}

function CardTitle({ children, className = "", ...props }: any) {
  return <h2 className={`text-lg font-semibold ${className}`} {...props}>{children}</h2>;
}

function CardContent({ children, className = "", ...props }: any) {
  return <div className={`p-4 ${className}`} {...props}>{children}</div>;
}

function Switch({ checked, onCheckedChange, id }: any) {
  return (
    <label className="inline-flex items-center cursor-pointer" htmlFor={id}>
      <span className="relative">
        <input type="checkbox" id={id} checked={checked} onChange={(e) => onCheckedChange(e.target.checked)} className="sr-only peer" />
        <div className="block w-10 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-offset-2 peer-focus:ring-blue-600 peer-checked:bg-blue-600" />
        <div className="absolute left-0 top-0 w-6 h-6 bg-white dark:bg-gray-800 rounded-full border border-gray-300 dark:border-gray-600 transform peer-checked:translate-x-4 transition-transform" />
      </span>
    </label>
  );
}

function Table({ children }: any) {
  return <table className="w-full border-collapse text-sm">{children}</table>;
}
function TableHeader({ children }: any) {
  return <thead className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">{children}</thead>;
}
function TableBody({ children }: any) {
  return <tbody>{children}</tbody>;
}
function TableRow({ children }: any) {
  return <tr className="border-b border-gray-200 dark:border-gray-700">{children}</tr>;
}
function TableHead({ children }: any) {
  return <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">{children}</th>;
}
function TableCell({ children }: any) {
  return <td className="py-2 px-3 whitespace-nowrap">{children}</td>;
}

// Device Type
type DeviceInfo = {
  id: string;
  serialNbr: string;
  manufacturer: string;
  model: string;
  productKey: string;
  date: string;
};

type AddDeviceStep = "input" | "confirm" | "submit";
type AdditionMode = "single" | "batch" | null;

export default function Page() {
  const [step, setStep] = useState<AddDeviceStep>("input");
  const [infoType, setInfoType] = useState<"msn" | "productKey">("msn");
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [currentDevice, setCurrentDevice] = useState<DeviceInfo>({
    id: "",
    serialNbr: "",
    manufacturer: "",
    model: "",
    productKey: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [lastScanned, setLastScanned] = useState<DeviceInfo[]>([]);
  const [isJsonFormat, setIsJsonFormat] = useState(true);
  const [additionMode, setAdditionMode] = useState<AdditionMode>(null);

  const addDevice = () => {
    if ((infoType === "msn" && currentDevice.serialNbr) || (infoType === "productKey" && currentDevice.productKey)) {
      const newDevice = { ...currentDevice, id: Date.now().toString(), date: new Date().toISOString().split('T')[0] };
      const updatedDevices = [...devices, newDevice];
      setDevices(updatedDevices);
      setCurrentDevice({
        id: "",
        serialNbr: "",
        manufacturer: "",
        model: "",
        productKey: "",
        date: new Date().toISOString().split("T")[0],
      });
      if (additionMode === "single") {
        setStep("confirm");
      }
    }
  };

  const removeDevice = (id: string) => {
    setDevices(devices.filter((device) => device.id !== id));
    setLastScanned(lastScanned.filter((device) => device.id !== id));
  };

  const updateDevice = (id: string, field: keyof DeviceInfo, value: string) => {
    setDevices(devices.map((device) => (device.id === id ? { ...device, [field]: value } : device)));
  };

  const simulateBarcodeScanner = () => {
    const mockSerialNumbers = ["SN123456", "SN234567", "SN345678", "SN456789", "SN567890"];
    let index = 0;
    const interval = setInterval(() => {
      if (index < mockSerialNumbers.length) {
        const newDevice: DeviceInfo = {
          id: Date.now().toString(),
          serialNbr: mockSerialNumbers[index],
          manufacturer: "",
          model: "",
          productKey: "",
          date: new Date().toISOString().split("T")[0],
        };
        setLastScanned((prev) => {
          const updated = [newDevice, ...prev].slice(0, 5);
          return updated;
        });
        index++;
      } else {
        clearInterval(interval);
      }
    }, 1000);
  };

  const removeLastScannedDevice = (id: string) => {
    setLastScanned(lastScanned.filter((device) => device.id !== id));
    setDevices(devices.filter((device) => device.id !== id));
  };

  const addAllScannedDevices = () => {
    setDevices((prevDevices) => {
      const uniqueDevices = lastScanned.filter(
        (scanned) => !prevDevices.some((device) => device.serialNbr === scanned.serialNbr)
      );
      return [...prevDevices, ...uniqueDevices];
    });
    setLastScanned([]);
    setStep("confirm");
  };

  const getStructuredData = () => {
    if (isJsonFormat) {
      return JSON.stringify(devices, null, 2);
    } else {
      const headers = ["id", "serialNbr", "manufacturer", "model", "productKey", "date"];
      const csvContent = [
        headers.join(","),
        ...devices.map((device) =>
          headers.map((header) => (device[header as keyof DeviceInfo] || "").toString()).join(",")
        ),
      ].join("\n");
      return csvContent;
    }
  };

  const onCancel = () => {
    // Reset process
    setStep("input");
    setDevices([]);
    setLastScanned([]);
    setAdditionMode(null);
    setCurrentDevice({
      id: "",
      serialNbr: "",
      manufacturer: "",
      model: "",
      productKey: "",
      date: new Date().toISOString().split("T")[0],
    });
  };

  const onSave = async (uploadedDevices: DeviceInfo[]) => {
    // Mock saving the devices
    console.log("Devices submitted:", uploadedDevices);
    // Reset after save
    setStep("input");
    setDevices([]);
    setLastScanned([]);
    setAdditionMode(null);
    alert("Devices submitted successfully!");
  };

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Device Upload Wizard</h1>

      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          {step !== "input" && (
            <Button onClick={() => setStep(step === "confirm" ? "input" : "confirm")} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          )}
        </div>

        <div className="flex space-x-2">
          {(devices.length > 0 || lastScanned.length > 0) && step !== "submit" && (
            <Button onClick={() => {
              if (step === "input" && additionMode === "batch") {
                addAllScannedDevices();
              } else {
                setStep(step === "input" ? "confirm" : "submit");
              }
            }}>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
          {devices.length === 0 && lastScanned.length === 0 && step === "input" && (
            <Button disabled className="opacity-50 cursor-not-allowed">
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="flex space-x-4">
        {["input", "confirm", "submit"].map((value, index) => (
          <React.Fragment key={index}>
            <div
              className={`w-3 h-3 rounded-full ${step === value ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"}`}
            />
            {index < 2 && <div className="flex-1 h-0.5 self-center bg-gray-300 dark:bg-gray-600" />}
          </React.Fragment>
        ))}
      </div>

      {step === "input" && (
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Select Addition Mode</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card
                  className={`cursor-pointer transition-all ${additionMode === "single" ? "ring-2 ring-blue-500 shadow-lg" : "hover:shadow-md"}`}
                  onClick={() => setAdditionMode("single")}
                >
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <UserPlus className="w-12 h-12 mb-4 text-blue-500" />
                    <h3 className="text-lg font-semibold">Add Single Device</h3>
                  </CardContent>
                </Card>

                <Card
                  className={`cursor-pointer transition-all ${additionMode === "batch" ? "ring-2 ring-blue-500 shadow-lg" : "hover:shadow-md"}`}
                  onClick={() => setAdditionMode("batch")}
                >
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <Users className="w-12 h-12 mb-4 text-blue-500" />
                    <h3 className="text-lg font-semibold">Bulk Scan</h3>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {additionMode === "single" && (
            <Card>
              <CardHeader>
                <CardTitle>Add Device Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <RadioGroup value={infoType} onChange={(e: any) => setInfoType(e.target.value)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="msn" id="msn" defaultChecked={infoType === "msn"} />
                      <Label htmlFor="msn">Serial Number + Manufacturer + Model</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="productKey" id="productKey" defaultChecked={infoType === "productKey"} />
                      <Label htmlFor="productKey">Product Key Only</Label>
                    </div>
                  </RadioGroup>

                  {infoType === "msn" ? (
                    <>
                      <Input
                        placeholder="Serial Number"
                        value={currentDevice.serialNbr}
                        onChange={(e) => setCurrentDevice({ ...currentDevice, serialNbr: e.target.value })}
                      />
                      <Input
                        placeholder="Manufacturer"
                        value={currentDevice.manufacturer}
                        onChange={(e) => setCurrentDevice({ ...currentDevice, manufacturer: e.target.value })}
                      />
                      <Input
                        placeholder="Model"
                        value={currentDevice.model}
                        onChange={(e) => setCurrentDevice({ ...currentDevice, model: e.target.value })}
                      />
                    </>
                  ) : (
                    <Input
                      placeholder="Product Key"
                      value={currentDevice.productKey}
                      onChange={(e) => setCurrentDevice({ ...currentDevice, productKey: e.target.value })}
                    />
                  )}

                  <Button onClick={addDevice} className="w-full">
                    <Plus className="mr-2 h-4 w-4" /> Add Device
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {additionMode === "batch" && (
            <Card>
              <CardHeader>
                <CardTitle>Last Scanned</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lastScanned.map((device) => (
                    <div key={device.id} className="flex justify-between items-center p-2 bg-gray-100 rounded">
                      <span>{device.serialNbr}</span>
                      <Button variant="ghost" size="sm" onClick={() => removeLastScannedDevice(device.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {lastScanned.length > 0 && (
                    <Button onClick={() => {
                      addAllScannedDevices();
                      setStep("confirm");
                    }} className="w-full bg-green-600 hover:bg-green-700">
                      <Plus className="mr-2 h-4 w-4" /> Add Devices ({lastScanned.length})
                    </Button>
                  )}
                  <Button onClick={simulateBarcodeScanner} className="w-full">
                    <Barcode className="mr-2 h-4 w-4" /> Simulate Barcode Scan
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {step === "confirm" && (
        <Card>
          <CardHeader>
            <CardTitle>Confirm Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Serial Number</TableHead>
                    <TableHead>Manufacturer</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Product Key</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {devices.map((device) => (
                    <TableRow key={device.id}>
                      <TableCell>
                        <Input
                          value={device.serialNbr}
                          onChange={(e) => updateDevice(device.id, "serialNbr", e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={device.manufacturer}
                          onChange={(e) => updateDevice(device.id, "manufacturer", e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={device.model}
                          onChange={(e) => updateDevice(device.id, "model", e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={device.productKey}
                          onChange={(e) => updateDevice(device.id, "productKey", e.target.value)}
                        />
                      </TableCell>
                      <TableCell>{device.date}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="destructive" size="sm" onClick={() => removeDevice(device.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "submit" && (
        <Card>
          <CardHeader>
            <CardTitle>Submission</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch id="format-toggle" checked={isJsonFormat} onCheckedChange={setIsJsonFormat} />
                <Label htmlFor="format-toggle">{isJsonFormat ? "JSON" : "CSV"}</Label>
              </div>
              <pre className="bg-gray-100 dark:bg-gray-900 dark:text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                {getStructuredData()}
              </pre>
              <div className="flex justify-end space-x-2">
                <Button onClick={() => onSave(devices)}>
                  Submit Devices
                </Button>
                <Button variant="outline" onClick={onCancel}>Cancel</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
