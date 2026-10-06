/**
 * OʻzMU JBNUU KPI Axborot Tizimi — E-IMZO Integratsiya Servisi (2026)
 * Oʻzbekiston Respublikasi DSQ / Raqamli Hukumat E-IMZO Agent mijozi bilan integratsiya.
 * Lokal port: wss://127.0.0.1:64443/service/cryptapi
 */

import { EimzoKeyItem } from "@/types";

export interface EimzoCertInfo {
  disk: string;
  path: string;
  name: string;
  alias: string;
  serialNumber: string;
  validFrom: string;
  validTo: string;
  CN: string;
  T?: string;
  O?: string;
  PINFL?: string;
  TIN?: string;
}

export class EimzoService {
  private static WS_URL = "wss://127.0.0.1:64443/service/cryptapi";

  /**
   * E-IMZO lokal agenti ishlab turganligini tekshirish
   */
  public static async isAgentAvailable(): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        const ws = new WebSocket(this.WS_URL);
        const timer = setTimeout(() => {
          try {
            ws.close();
          } catch {}
          resolve(false);
        }, 1200);

        ws.onopen = () => {
          clearTimeout(timer);
          try {
            ws.close();
          } catch {}
          resolve(true);
        };

        ws.onerror = () => {
          clearTimeout(timer);
          resolve(false);
        };
      } catch {
        resolve(false);
      }
    });
  }

  /**
   * Lokal kompyuterdan barcha E-IMZO (.pfx / USB token) sertifikatlarini yuklash
   */
  public static async listAllCertificates(): Promise<EimzoKeyItem[]> {
    return new Promise((resolve, reject) => {
      let ws: WebSocket;
      try {
        ws = new WebSocket(this.WS_URL);
      } catch (err) {
        return reject(new Error("E-IMZO agenti bilan ulanish oʻrnatib boʻlmadi"));
      }

      const timeout = setTimeout(() => {
        try {
          ws.close();
        } catch {}
        reject(new Error("E-IMZO javob berish vaqti tugadi"));
      }, 5000);

      ws.onopen = () => {
        // 1. PFX sertifikatlarini so'rash
        const req = JSON.stringify({
          plugin: "pfx",
          name: "list_all_certificates"
        });
        ws.send(req);
      };

      ws.onmessage = (event) => {
        clearTimeout(timeout);
        try {
          const data = JSON.parse(event.data);
          if (data.success && Array.isArray(data.certificates)) {
            const keys: EimzoKeyItem[] = data.certificates.map((c: any, idx: number) => {
              const parsed = this.parseX500Name(c.x500Name || "");
              return {
                id: c.alias || `key_${idx}`,
                cn: parsed.CN || c.CN || "Nomaʼlum egasi",
                pinfl: parsed.PINFL || "",
                inn: parsed.TIN || "",
                org: parsed.O || "Jismoniy shaxs",
                role: parsed.T || "Xodim",
                valid_from: c.validFrom ? c.validFrom.split(" ")[0] : "",
                valid_to: c.validTo ? c.validTo.split(" ")[0] : "",
                serial_number: c.serialNumber || c.serial || `SER_${idx}`,
                is_demo: false
              };
            });
            ws.close();
            resolve(keys);
          } else {
            ws.close();
            resolve([]);
          }
        } catch (e) {
          ws.close();
          reject(e);
        }
      };

      ws.onerror = () => {
        clearTimeout(timeout);
        reject(new Error("E-IMZO moduli bilan aloqa uzildi"));
      };
    });
  }

  /**
   * X500 Name satridan CN, PINFL (1.2.860.3.16.1.1), INN (1.2.860.3.16.1.2) larni ajratib olish
   */
  private static parseX500Name(x500: string): { CN?: string; PINFL?: string; TIN?: string; O?: string; T?: string } {
    const result: { CN?: string; PINFL?: string; TIN?: string; O?: string; T?: string } = {};
    if (!x500) return result;

    const parts = x500.split(",");
    for (const part of parts) {
      const [key, val] = part.split("=").map((s) => s.trim());
      if (!key || !val) continue;

      const upperKey = key.toUpperCase();
      if (upperKey === "CN") {
        result.CN = val;
      } else if (upperKey === "O") {
        result.O = val;
      } else if (upperKey === "T") {
        result.T = val;
      } else if (key === "1.2.860.3.16.1.1") {
        result.PINFL = val;
      } else if (key === "1.2.860.3.16.1.2") {
        result.TIN = val;
      }
    }
    return result;
  }

  /**
   * Tanlangan kalit va challenge kodini imzolash (PKCS#7)
   */
  public static async signChallenge(
    key: EimzoKeyItem,
    password: string,
    challenge: string
  ): Promise<{ pkcs7: string }> {
    return new Promise((resolve, reject) => {
      let ws: WebSocket;
      try {
        ws = new WebSocket(this.WS_URL);
      } catch {
        return reject(new Error("E-IMZO agentiga ulanib boʻlmadi"));
      }

      const timeout = setTimeout(() => {
        try {
          ws.close();
        } catch {}
        reject(new Error("Imzolash vaqti tugadi"));
      }, 10000);

      let step = 1;

      ws.onopen = () => {
        // 1-bosqich: Kalitni yuklash
        ws.send(
          JSON.stringify({
            plugin: "pfx",
            name: "load_key",
            arguments: ["disk", "", key.id, password]
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          const res = JSON.parse(event.data);
          if (step === 1) {
            if (res.success && res.keyId) {
              step = 2;
              // 2-bosqich: PKCS#7 imzo yaratish
              ws.send(
                JSON.stringify({
                  plugin: "pkcs7",
                  name: "create_pkcs7",
                  arguments: [res.keyId, challenge, "no"]
                })
              );
            } else {
              clearTimeout(timeout);
              ws.close();
              reject(new Error(res.reason || "Kalit paroli notoʻgʻri yoki kalit yuklanmadi"));
            }
          } else if (step === 2) {
            clearTimeout(timeout);
            ws.close();
            if (res.success && res.pkcs7_64) {
              resolve({ pkcs7: res.pkcs7_64 });
            } else {
              reject(new Error(res.reason || "PKCS#7 imzo yaratishda xatolik yuz berdi"));
            }
          }
        } catch (e) {
          clearTimeout(timeout);
          ws.close();
          reject(e);
        }
      };

      ws.onerror = () => {
        clearTimeout(timeout);
        reject(new Error("E-IMZO bilan aloqa uzildi"));
      };
    });
  }
}
