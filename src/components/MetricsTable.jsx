import React from "react";
import { Badge } from "./badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import ProgressBar from "./ProgressBar";

const MetricsTable = ({ metrics }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case "Matched":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Matched
          </Badge>
        );
      case "Missing":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            Missing
          </Badge>
        );
      case "Additional":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Additional
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Skill/Keyword</TableHead>
            <TableHead>Resume Coverage</TableHead>
            <TableHead>JD Coverage</TableHead>
            <TableHead className="text-right">Resume Frequency</TableHead>
            <TableHead className="text-right">JD Frequency</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {metrics.map((row, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{row.skill}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <ProgressBar
                    progress={row.resumeCoverage}
                    className="w-24 h-2"
                  />
                  <span className="text-sm">{row.resumeCoverage}%</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <ProgressBar progress={row.jdCoverage} className="w-24 h-2" />
                  <span className="text-sm">{row.jdCoverage}%</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                {row.resumeFrequency}
              </TableCell>
              <TableCell className="text-right">{row.jdFrequency}</TableCell>
              <TableCell>{getStatusBadge(row.status)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default MetricsTable;
