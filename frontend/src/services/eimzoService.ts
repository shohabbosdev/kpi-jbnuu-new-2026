/**
 * OʻzMU JBNUU KPI Axborot Tizimi — E-IMZO Integratsiya Servisi (2026)
 * Oʻzbekiston Respublikasi DSQ / Raqamli Hukumat E-IMZO Agent mijozi bilan integratsiya.
 * Lokal port: wss://127.0.0.1:64443/service/cryptapi
 */

import { EimzoKeyItem } from "@/types";

export class EimzoService {
  private static WS_URL = "wss://127.0.0.1:64443/service/cryptapi";

  private static API_KEYS = [
    "null",
    "E0A205EC4E7B78BBB56AFF83A733A1BB9FD39D562E67978CC5E7D73B0951DB1954595A20672A63332535E13CC6EC1E1FC8857BB09E0855D7E76E411B6FA16E9D",
    "localhost",
    "96D0C1491615C82B9A54D9989779DF825B690748224C2B04F500F370D51827CE2644D8D4A82C18184D73AB8530BB8ED537269603F61DB0D03D2104ABF789970B",
    "127.0.0.1",
    "A7BCFA5D490B351BE0754130DF03A068F855DB4333D43921125B9CF2670EF6A40370C646B90401955E1F7BC9CDBF59CE0B2C5467D820BE189C845D0B79CFC96F"
  ];

  /**
   * E-IMZO agentiga xavfsiz so'rov yuborish (Rasmiy CAPIWS arxitekturasi)
   */
  private static callApi(payload: any, timeoutMs: number = 60000): Promise<any> {
    return new Promise((resolve, reject) => {
      let ws: WebSocket;
      try {
        ws = new WebSocket(this.WS_URL);
      } catch (err) {
        return reject(new Error("E-IMZO agenti bilan WebSocket aloqasi oʻrnatib boʻlmadi"));
      }

      const timer = setTimeout(() => {
        try {
          ws.close();
        } catch {}
        reject(new Error("E-IMZO moduli javob berish vaqti tugadi yoki operatsiya bekor qilindi"));
      }, timeoutMs);

      ws.onopen = () => {
        try {
          ws.send(JSON.stringify(payload));
        } catch (e) {
          clearTimeout(timer);
          ws.close();
          reject(e);
        }
      };

      ws.onmessage = (event) => {
        clearTimeout(timer);
        try {
          const data = JSON.parse(event.data);
          ws.close();
          resolve(data);
        } catch (e) {
          ws.close();
          reject(e);
        }
      };

      ws.onerror = () => {
        clearTimeout(timer);
        reject(new Error("E-IMZO moduli bilan aloqada xatolik yuz berdi"));
      };
    });
  }

  /**
   * Domen uchun API-kalitlarini ro'yxatdan o'tkazish
   */
  public static async installApiKeys(): Promise<boolean> {
    try {
      const res = await this.callApi(
        {
          name: "apikey",
          arguments: this.API_KEYS
        },
        5000
      );
      return !!res?.success;
    } catch {
      return false;
    }
  }

  /**
   * E-IMZO lokal agenti ishlab turganligini tekshirish
   */
  public static async isAgentAvailable(): Promise<boolean> {
    try {
      const res = await this.callApi(
        {
          name: "apikey",
          arguments: this.API_KEYS
        },
        2000
      );
      return res && res.success !== undefined;
    } catch {
      return false;
    }
  }

  /**
   * Lokal kompyuterdan barcha E-IMZO (.pfx / USB token) sertifikatlarini yuklash
   */
  public static async listAllCertificates(): Promise<EimzoKeyItem[]> {
    // 1. Domen kalitlarini o'rnatamiz
    await this.installApiKeys();

    // 2. PFX sertifikatlarini so'raymiz
    const data = await this.callApi(
      {
        plugin: "pfx",
        name: "list_all_certificates"
      },
      8000
    );

    if (data && data.success && Array.isArray(data.certificates)) {
      return data.certificates.map((c: any, idx: number) => {
        const parsed = this.parseCertAlias(c.alias || "");
        return {
          id: c.name || `key_${idx}`,
          disk: c.disk || "",
          path: c.path || "",
          name: c.name || "",
          alias: c.alias || "",
          cn: parsed.cn,
          pinfl: parsed.pinfl,
          inn: parsed.inn,
          org: parsed.org,
          role: parsed.role,
          valid_from: parsed.validFrom,
          valid_to: parsed.validTo,
          serial_number: parsed.serialNumber || c.serialNumber || `SER_${idx}`
        };
      });
    }

    return [];
  }

  /**
   * E-IMZO sertifikatining alias satrini aniq parslash
   */
  public static parseCertAlias(aliasStr: string): {
    cn: string;
    pinfl: string;
    inn: string;
    org: string;
    role: string;
    serialNumber: string;
    validFrom: string;
    validTo: string;
  } {
    const map: Record<string, string> = {};
    if (!aliasStr) {
      return {
        cn: "Nomaʼlum egasi",
        pinfl: "",
        inn: "",
        org: "Jismoniy shaxs",
        role: "Xodim",
        serialNumber: "",
        validFrom: "",
        validTo: ""
      };
    }

    const parts = aliasStr.split(",");
    for (const p of parts) {
      const idx = p.indexOf("=");
      if (idx > -1) {
        const k = p.substring(0, idx).trim().toLowerCase();
        const v = p.substring(idx + 1).trim();
        map[k] = v;
      }
    }

    // 1. F.I.Sh. (cn)
    let cn = map["cn"] || "";
    if (!cn && (map["surname"] || map["name"])) {
      cn = `${map["surname"] || ""} ${map["name"] || ""}`.trim();
    }
    cn = cn ? cn.toUpperCase() : "Nomaʼlum egasi";

    // 2. JSHSHIR (PINFL - 14 xonali raqam)
    let pinfl = "";
    const p1 = map["1.2.860.3.16.1.1"] || "";
    const p2 = map["1.2.860.3.16.1.2"] || "";

    if (p1.length === 14) {
      pinfl = p1;
    } else if (p2.length === 14) {
      pinfl = p2;
    }

    // 3. STIR (INN - 9 xonali raqam)
    let inn = map["uid"] || "";
    if (!inn && p2.length === 9) {
      inn = p2;
    } else if (!inn && p1.length === 9) {
      inn = p1;
    }

    // 4. Tashkilot / Hudud
    let org = map["o"] || "";
    if (!org) {
      const loc = [map["l"], map["st"]].filter(Boolean).join(", ");
      org = loc ? loc.toUpperCase() : "Jismoniy shaxs";
    }

    // 5. Amal qilish muddati
    const validFrom = map["validfrom"] ? map["validfrom"].split(" ")[0].replace(/\./g, "-") : "";
    const validTo = map["validto"] ? map["validto"].split(" ")[0].replace(/\./g, "-") : "";

    return {
      cn,
      pinfl,
      inn,
      org,
      role: map["t"] || "Xodim",
      serialNumber: map["serialnumber"] || "",
      validFrom,
      validTo
    };
  }

  /**
   * Tanlangan kalit va challenge kodini imzolash (PKCS#7)
   */
  public static async signChallenge(
    key: EimzoKeyItem,
    challenge: string
  ): Promise<{ pkcs7: string }> {
    // 1. Avval API-kalitlarini o'rnatish
    await this.installApiKeys();

    // 2. Kalitni yuklash: [disk, path, name, alias]
    const loadRes = await this.callApi(
      {
        plugin: "pfx",
        name: "load_key",
        arguments: [key.disk, key.path, key.name, key.alias]
      },
      15000
    );

    if (!loadRes || !loadRes.success || !loadRes.keyId) {
      throw new Error(loadRes?.reason || "E-IMZO kalitini tizimga yuklab boʻlmadi");
    }

    const keyId = loadRes.keyId;

    // 3. Challenge kodini Base64 ga o'tkazish
    const challengeBase64 =
      typeof window !== "undefined" && window.btoa
        ? window.btoa(unescape(encodeURIComponent(challenge)))
        : Buffer.from(challenge).toString("base64");

    // 4. create_pkcs7 orqali imzo yaratish: [data_64, keyId, "no"]
    // E-IMZO moduli agar parol eslab qolinmagan bo'lsa, o'zining rasmiy dialog darchasini ochadi
    // Agar parol allaqachon eslab qolingan bo'lsa, to'g'ridan-to'g'ri darhol imzo qaytaradi.
    const signRes = await this.callApi(
      {
        plugin: "pkcs7",
        name: "create_pkcs7",
        arguments: [challengeBase64, keyId, "no"]
      },
      60000
    );

    if (signRes && signRes.success && signRes.pkcs7_64) {
      return { pkcs7: signRes.pkcs7_64 };
    }

    throw new Error(signRes?.reason || "E-IMZO orqali tasdiqlash rad etildi yoki parol notoʻgʻri kiritildi");
  }
}
