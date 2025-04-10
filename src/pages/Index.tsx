
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import Advertisement from "@/components/Advertisement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t("welcome")}</h1>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <Link to="/admin">
            <Button variant="outline">{t("adminDashboard")}</Button>
          </Link>
        </div>
      </div>

      <Card className="shadow-lg border-t-4 border-t-primary mb-8">
        <CardHeader className="bg-muted/50">
          <CardTitle className="text-2xl">{t("greeting")}</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p>Welcome to our application. Use the admin panel to configure settings.</p>
        </CardContent>
      </Card>

      {/* Show advertisement */}
      <Advertisement />
    </div>
  );
};

export default Index;
