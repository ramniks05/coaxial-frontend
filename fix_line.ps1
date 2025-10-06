$content = Get-Content 'src/components/master-data/TopicManagement.js' -Raw
$content = $content -replace '}, \[filters\.courseId, token, classSubjects, examSubjects, filters\.courseTypeId\]\);', '}, [filters.courseId, token, classSubjects, examSubjects]);'
$content | Set-Content 'src/components/master-data/TopicManagement.js'
