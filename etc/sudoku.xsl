<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:template match="/">
		<div id="sudoku">
			<table>
				<xsl:apply-templates match="//row" />
			</table>
		</div>
		<div id="check-sudoku">Check it out!</div>
		<div id="submit-sudoku">Submit</div>
		<hr style="margin: 20px 0;" />
		<div>
			<span>Error Row: </span>
			<span id="error-row-sudoku">-</span>
			<br/>
			<span>Error Column: </span>
			<span id="error-col-sudoku">-</span>
			<br/>
			<span>Error: </span>
			<span id="error-dsp-sudoku">-</span>
		</div>
	</xsl:template>

	<xsl:template match="row">
		<tr>
			<xsl:apply-templates match="./cell" />
		</tr>
	</xsl:template>

	<xsl:template match="cell">
		<xsl:choose>
			<xsl:when test=". != ''">
				<td contenteditable="false" class="cell">
					<xsl:value-of select="."/>
				</td>
			</xsl:when>
			<xsl:otherwise>
				<td contenteditable="true" class="cell">
					<xsl:value-of select="."/>
				</td>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
</xsl:stylesheet>
