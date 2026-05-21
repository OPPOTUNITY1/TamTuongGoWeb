import { useState, useEffect } from "react";

export interface VnProvince {
  code: number;
  name: string;
}

export interface VnDistrict {
  code: number;
  name: string;
}

export interface VnWard {
  code: number;
  name: string;
}

const BASE = "https://provinces.open-api.vn/api";

// Simple in-memory cache to avoid re-fetching on modal re-open
const cache: {
  provinces?: VnProvince[];
  districts: Record<number, VnDistrict[]>;
  wards: Record<number, VnWard[]>;
} = { districts: {}, wards: {} };

export function useVnAddress(initialCity?: string, initialDistrict?: string) {
  const [provinces, setProvinces] = useState<VnProvince[]>(cache.provinces ?? []);
  const [districts, setDistricts] = useState<VnDistrict[]>([]);
  const [wards, setWards] = useState<VnWard[]>([]);

  const [provinceCode, setProvinceCode] = useState<number | null>(null);
  const [districtCode, setDistrictCode] = useState<number | null>(null);

  const [loadingProvinces, setLoadingProvinces] = useState(!cache.provinces);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  // Load all provinces once
  useEffect(() => {
    if (cache.provinces) {
      setProvinces(cache.provinces);
      setLoadingProvinces(false);
      return;
    }
    setLoadingProvinces(true);
    fetch(`${BASE}/p/`)
      .then((r) => r.json())
      .then((data: VnProvince[]) => {
        cache.provinces = data;
        setProvinces(data);
      })
      .catch(() => {})
      .finally(() => setLoadingProvinces(false));
  }, []);

  // Pre-select province when provinces load + initialCity given
  useEffect(() => {
    if (!initialCity || provinces.length === 0 || provinceCode !== null) return;
    const match = provinces.find(
      (p) => p.name.toLowerCase() === initialCity.toLowerCase()
    );
    if (match) setProvinceCode(match.code);
  }, [provinces, initialCity, provinceCode]);

  // Fetch districts when province selected
  useEffect(() => {
    if (provinceCode == null) {
      setDistricts([]);
      setWards([]);
      setDistrictCode(null);
      return;
    }
    if (cache.districts[provinceCode]) {
      setDistricts(cache.districts[provinceCode]);
      return;
    }
    setLoadingDistricts(true);
    setDistricts([]);
    setWards([]);
    fetch(`${BASE}/p/${provinceCode}?depth=2`)
      .then((r) => r.json())
      .then((data: { districts: VnDistrict[] }) => {
        const list = data.districts ?? [];
        cache.districts[provinceCode] = list;
        setDistricts(list);
      })
      .catch(() => {})
      .finally(() => setLoadingDistricts(false));
  }, [provinceCode]);

  // Pre-select district when districts load + initialDistrict given
  useEffect(() => {
    if (!initialDistrict || districts.length === 0 || districtCode !== null) return;
    const match = districts.find(
      (d) => d.name.toLowerCase() === initialDistrict.toLowerCase()
    );
    if (match) setDistrictCode(match.code);
  }, [districts, initialDistrict, districtCode]);

  // Fetch wards when district selected
  useEffect(() => {
    if (districtCode == null) {
      setWards([]);
      return;
    }
    if (cache.wards[districtCode]) {
      setWards(cache.wards[districtCode]);
      return;
    }
    setLoadingWards(true);
    setWards([]);
    fetch(`${BASE}/d/${districtCode}?depth=2`)
      .then((r) => r.json())
      .then((data: { wards: VnWard[] }) => {
        const list = data.wards ?? [];
        cache.wards[districtCode] = list;
        setWards(list);
      })
      .catch(() => {})
      .finally(() => setLoadingWards(false));
  }, [districtCode]);

  const resetCodes = () => {
    setProvinceCode(null);
    setDistrictCode(null);
    setDistricts([]);
    setWards([]);
  };

  return {
    provinces,
    districts,
    wards,
    provinceCode,
    districtCode,
    setProvinceCode,
    setDistrictCode,
    loadingProvinces,
    loadingDistricts,
    loadingWards,
    resetCodes,
  };
}
