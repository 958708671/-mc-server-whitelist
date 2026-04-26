$content = Get-Content -Path "e:\程序\-mc-server-whitelist\data\questions.ts" -Raw -Encoding UTF8

$farmingStart = $content.IndexOf("id: 'farming'")
$farmingBlockEnd = $content.IndexOf("`n  },", $farmingStart)
$farmingBlock = $content.Substring($farmingStart, $farmingBlockEnd - $farmingStart + 5)

$miningStart = $content.IndexOf("id: 'mining'")
$miningBlockEnd = $content.IndexOf("`n  },", $miningStart)
$miningBlock = $content.Substring($miningStart, $miningBlockEnd - $miningStart + 5)

$survivalStart = $content.IndexOf("id: 'survival'")
$survivalBlockEnd = $content.IndexOf("`n  },", $survivalStart)
$survivalBlock = $content.Substring($survivalStart, $survivalBlockEnd - $survivalStart + 5)

$brewingStart = $content.IndexOf("id: 'brewing'")
$brewingBlockEnd = $content.IndexOf("`n  },", $brewingStart)
$brewingBlock = $content.Substring($brewingStart, $brewingBlockEnd - $brewingStart + 5)

$enchantingStart = $content.IndexOf("id: 'enchanting'")
$enchantingBlockEnd = $content.IndexOf("`n  },", $enchantingStart)
$enchantingBlock = $content.Substring($enchantingStart, $enchantingBlockEnd - $enchantingStart + 5)

$farmingQuestions = [regex]::Match($farmingBlock, "(?s)questions: \[(.*?)\n    \]").Groups[1].Value
$miningQuestions = [regex]::Match($miningBlock, "(?s)questions: \[(.*?)\n    \]").Groups[1].Value
$survivalQuestions = [regex]::Match($survivalBlock, "(?s)questions: \[(.*?)\n    \]").Groups[1].Value
$brewingQuestions = [regex]::Match($brewingBlock, "(?s)questions: \[(.*?)\n    \]").Groups[1].Value
$enchantingQuestions = [regex]::Match($enchantingBlock, "(?s)questions: \[(.*?)\n    \]").Groups[1].Value

$newSurvivalQuestions = $survivalQuestions + "," + $farmingQuestions + "," + $miningQuestions
$newEnchantingQuestions = $enchantingQuestions + "," + $brewingQuestions

$content = $content -replace [regex]::Escape($survivalQuestions), $newSurvivalQuestions
$content = $content -replace [regex]::Escape($enchantingQuestions), $newEnchantingQuestions

$categoriesToRemove = @('elderly', 'pvp', 'adventure', 'nether', 'end', 'fishing', 'trading', 'farming', 'mining', 'brewing')

foreach ($id in $categoriesToRemove) {
    $pattern = "(?s)\{\s*id: '$id'.*?\n  \},"
    $content = $content -replace $pattern, ''
}

$content = $content -replace "name: '附魔'", "name: '附魔与酿造'"

$content = $content -replace ",\s*note: '[^']*'", ''
$content = $content -replace ",\s*note: \[[^\]]*\]", ''

$content = $content -replace "description: '[^']*',", "description: '',"

[System.IO.File]::WriteAllText("e:\程序\-mc-server-whitelist\data\questions_new.ts", $content, [System.Text.Encoding]::UTF8)
Write-Host "Done"