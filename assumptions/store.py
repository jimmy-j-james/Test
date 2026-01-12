from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Callable, Dict, Iterable, List, Optional


@dataclass
class AssumptionRecord:
    field: str
    value: Any = None
    source: Optional[str] = None
    confidence: Optional[float] = None

    def is_missing(self) -> bool:
        return self.value is None or self.value == ""

    def is_low_confidence(self, threshold: float) -> bool:
        if self.confidence is None:
            return True
        return self.confidence < threshold


@dataclass
class AssumptionStore:
    _records: Dict[str, AssumptionRecord] = field(default_factory=dict)
    _parsers: Dict[str, Callable[[Any], Any]] = field(default_factory=dict)

    def add_records(self, records: Iterable[AssumptionRecord]) -> None:
        for record in records:
            self._records[record.field] = record

    def register_parser(self, field_name: str, parser: Callable[[Any], Any]) -> None:
        self._parsers[field_name] = parser

    def update_field(
        self,
        field_name: str,
        value: Any,
        *,
        source: Optional[str] = None,
        confidence: Optional[float] = None,
    ) -> None:
        if field_name not in self._records:
            self._records[field_name] = AssumptionRecord(field=field_name)
        record = self._records[field_name]
        record.value = value
        if source is not None:
            record.source = source
        if confidence is not None:
            record.confidence = confidence

    def build_table(self) -> List[Dict[str, Any]]:
        return [
            {
                "field": record.field,
                "value": record.value,
                "source": record.source,
                "confidence": record.confidence,
            }
            for record in self._records.values()
        ]

    def missing_or_low_confidence(self, threshold: float = 0.5) -> List[AssumptionRecord]:
        return [
            record
            for record in self._records.values()
            if record.is_missing() or record.is_low_confidence(threshold)
        ]

    def apply_inline_edits(self, edits: Dict[str, Any]) -> None:
        for field_name, raw_value in edits.items():
            parser = self._parsers.get(field_name, lambda value: value)
            parsed_value = parser(raw_value)
            self.update_field(field_name, parsed_value)

    def export(self) -> List[Dict[str, Any]]:
        return [
            {
                "field": record.field,
                "value": record.value,
                "source": record.source,
                "confidence": record.confidence,
            }
            for record in self._records.values()
        ]
