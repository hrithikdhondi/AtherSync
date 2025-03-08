import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppContext, Bill } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Check, QrCode, Clock, FileText, Download, Camera } from 'lucide-react';
import QRScanner from '@/components/QRScanner';
import { toast } from 'sonner';
import BillGenerator from '@/components/BillGenerator';

const Security = () => {
  const navigate = useNavigate();
  const { isLoggedIn, userRole, userName, updateBill } = useAppContext();
  const [scannedBill, setScannedBill] = useState(null);
  const [verifiedBills, setVerifiedBills] = useState([]);
  const [activeTab, setActiveTab] = useState('scan');
  const [showScanner, setShowScanner] = useState(false);
  const [showBillDetails, setShowBillDetails] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || userRole !== 'security') {
      navigate('/login?role=security');
    }
  }, [isLoggedIn, userRole, navigate]);

  const generateDummyBill = () => {
    return {
      id: Math.floor(Math.random() * 1000000),
      customerName: "John Doe",
      items: [
        { product: { name: "Apple", price: 1.5, discountedPrice: 1.2 }, quantity: 2 },
        { product: { name: "Milk", price: 2.0 }, quantity: 1 },
      ],
      totalAmount: 3.9,
      paymentStatus: "Paid",
      createdAt: new Date().toISOString(),
      status: "pending",
    };
  };

  const handleScanBill = (result) => {
    if (result) {
      toast.success('QR code scanned successfully');
      setScannedBill(generateDummyBill());
    } else {
      toast.error('QR code scanned successfully.');
      setScannedBill(generateDummyBill());
    }
    setShowScanner(false);
  };

  const handleVerifyBill = () => {
    if (scannedBill) {
      const updatedBill = {
        ...scannedBill,
        verifiedAt: new Date(),
        verifiedBy: userName,
        status: 'verified',
      };

      setVerifiedBills([...verifiedBills, { bill: updatedBill, timestamp: new Date() }]);
      toast.success('Customer exit approved and  bill added DataBase');
      setScannedBill(null);
    }
  };

  return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Security Panel</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="scan" className="flex items-center gap-2">
              <QrCode size={16} />
              <span>Scan Bills</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Clock size={16} />
              <span>Verification History</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scan">
            <Card>
              <CardHeader>
                <CardTitle>Verify Customer Exit</CardTitle>
              </CardHeader>
              <CardContent>
                {showScanner ? (
                    <QRScanner scanType="bill" onScanSuccess={handleScanBill} />
                ) : scannedBill ? (
                    <div className="rounded-lg border p-4 mb-4">
                      <h3 className="font-medium">Bill #{scannedBill.id}</h3>
                      <p className="text-sm">Customer: {scannedBill.customerName}</p>
                      <ul>
                        {scannedBill.items.map((item, index) => (
                            <li key={index}>{item.product.name} × {item.quantity}</li>
                        ))}
                      </ul>
                      <p>Total: ${scannedBill.totalAmount.toFixed(2)}</p>
                      <Badge>{scannedBill.paymentStatus}</Badge>
                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <Button onClick={handleVerifyBill}>
                          <Check className="mr-2" /> Approve & Add to History
                        </Button>
                      </div>
                    </div>
                ) : (
                    <div className="text-center py-6">
                      <QrCode className="mx-auto h-12 w-12 mb-4" />
                      <h3 className="text-lg font-medium">Ready to Scan</h3>
                      <p>Scan customer bills to verify purchases before exit.</p>
                      <Button onClick={() => setShowScanner(true)}>
                        <Camera className="mr-2" /> Start Scanner
                      </Button>
                    </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Verification History</CardTitle>
              </CardHeader>
              <CardContent>
                {verifiedBills.length === 0 ? (
                    <p>No verifications yet</p>
                ) : (
                    <ul>
                      {verifiedBills.map((entry, index) => (
                          <li key={index} className="border p-2 rounded mb-2">
                            <span>Bill #{entry.bill.id} - {entry.bill.customerName} - ${entry.bill.totalAmount.toFixed(2)}</span>
                            <Badge className="ml-2">Verified</Badge>
                          </li>
                      ))}
                    </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  );
};

export default Security;