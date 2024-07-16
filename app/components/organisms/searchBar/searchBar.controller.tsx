import { useCallback, useState } from "react";
import countriesCoords from "@/app/data/country-codes-lat-long-alpha3.json";
import debounce from "lodash/debounce";
import { SearchSubjectType } from "@/app/enums/SearchSubjectType";
import { Feature, GeocodeResponse } from "@/app/types/orsTypes";
import { autocomplete } from "@/app/server/services/openRouteService";
import { Country } from "@/app/types/countryType";
import { Selection } from "@nextui-org/react";
import { useSearchBar } from "@/app/components/organisms/searchBar/searchBar.model";
import { Key } from "@react-types/shared";
import { CameraFlyController } from "@/app/components/atoms/three/cameraFlyController";

export function SearchBarController() {
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [featureSuggestions, setFeatureSuggestions] = useState<Feature[]>([]);
  const [countrySuggestions, setCountrySuggestions] = useState<Country[]>([]);

  const defaultErrorMessage = "Please provide a valid input.";
  const [errorMessage, setErrorMessage] = useState<string>(defaultErrorMessage);
  const [isInvalid, setIsInvalid] = useState<boolean>(false);

  const [inputLabel, setInputLabel] = useState<string>("Country Name");

  const [autoCompleteError, setAutoCompleteError] = useState<string>();
  const [autoCompleteLoading, setAutoCompleteLoading] =
    useState<boolean>(false);

  const { selectedSubject, setSelectedSubject } = useSearchBar();

  const { flyToCountryPos, flyToCoordinates } = CameraFlyController();

  /**
   * Debounced function to handle input changes.
   */
  const handleInputChange = useCallback(
    debounce(async (value: string) => {
      if (value.trim() === "") {
        setFeatureSuggestions([]);
        setCountrySuggestions([]);
        return;
      }

      try {
        setAutoCompleteLoading(true);
        setAutoCompleteError("");

        if (selectedSubject === SearchSubjectType.PLACE) {
          // Call server-side function.
          const data: GeocodeResponse = await autocomplete(value);
          setFeatureSuggestions(data.features || []);
        } else if (selectedSubject === SearchSubjectType.COUNTRY) {
          // Filter countries based on input value.
          const filteredCountries =
            countriesCoords.ref_country_codes.filter((country: Country) =>
              country.country
                .toLowerCase()
                .startsWith(value.toLowerCase())
            );

          setCountrySuggestions(filteredCountries || []);
        }
      } catch (err) {
        setAutoCompleteError("Error fetching autocomplete results.");
      } finally {
        setAutoCompleteLoading(false);
      }
    }, 300), // Throttle input to 300ms.
    [selectedSubject]
  );

  /**
   *
   * @param value
   */
  const onInputChange = (value: string) => {
    resetSelection();
    setSearchTerm(value);
    handleInputChange(value);
  };

  /**
   *
   */
  const resetSelection = (): void => {
    setIsInvalid(false);
    setErrorMessage(defaultErrorMessage);
    setSearchTerm("");
  };

  /**
   *
   * @param key
   */
  const onSelectionChange = (key: Key | null): void => {
    // TODO onSearch(selectedSuggestion.properties.label)

    switch (selectedSubject) {
      case SearchSubjectType.PLANE:
        break;
      case SearchSubjectType.COUNTRY:
        if (flyToCountryPos(key as string)) {
          setIsInvalid(false);
        } else {
          setErrorMessage("Invalid Country Name.");
          setIsInvalid(true);
        }
        setCountrySuggestions([]);
        break;
      case SearchSubjectType.PLACE:
        const selectedSuggestion: Feature | undefined =
          featureSuggestions.find(
            (suggestion: Feature): boolean =>
              suggestion.properties?.id === key
          );

        if (selectedSuggestion) {
          setSearchTerm(selectedSuggestion.properties.label);
          setFeatureSuggestions([]);

          flyToCoordinates(
            selectedSuggestion.geometry.coordinates[1],
            selectedSuggestion.geometry.coordinates[0]
          );
        }
        break;
      case SearchSubjectType.VESSEL:
        break;
      default:
        break;
    }
  };

  /**
   *
   * @param keys
   */
  const onSubjectSelected = (keys: Selection): void => {
    resetSelection();

    const selectedKey: SearchSubjectType = Array.from(
      keys
    )[0] as string as SearchSubjectType;
    setSelectedSubject(selectedKey);

    switch (selectedKey) {
      case SearchSubjectType.PLANE:
        setInputLabel("Plane Name");
        break;
      case SearchSubjectType.COUNTRY:
        setInputLabel("Country Name");
        break;
      case SearchSubjectType.PLACE:
        setInputLabel("Place Name");
        break;
      case SearchSubjectType.VESSEL:
        setInputLabel("Vessel Name");
        break;
      default:
        break;
    }
  };

  return {
    autoCompleteError,
    autoCompleteLoading,
    isInvalid,
    errorMessage,
    handleInputChange,
    selectedSubject,
    inputLabel,
    searchTerm,
    featureSuggestions,
    countrySuggestions,
    onSubjectSelected,
    onInputChange,
    onSelectionChange
  };
}
